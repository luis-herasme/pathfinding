import { Box2D } from "./box";
import { QuadGraph } from "./quad-graph";
import { aStar } from "./pathfinding/a-star";
import { Vector2 } from "three";
import { funnelPathSmoothing } from "./pathfinding/funnel";
import { CellDecomposition, PathfindingObstacle } from "./cell-decomposition";

function getPortals(path: CellDecomposition[]): {
  left: Vector2;
  right: Vector2;
}[] {
  const portals: {
    left: Vector2;
    right: Vector2;
  }[] = [];
  portals.push({
    left: path[0].bbox.center,
    right: path[0].bbox.center,
  });

  for (let i = 0; i < path.length - 1; i++) {
    const sharedEdge = getSharedEdge(path[i].bbox, path[i + 1].bbox);
    portals.push(sharedEdge);
  }

  return portals;
}

// Gets the shared edge between two boxes
function getSharedEdge(
  box1: Box2D,
  box2: Box2D
): {
  left: Vector2;
  right: Vector2;
} {
  const sharedEdge = {
    left: new Vector2(0, 0),
    right: new Vector2(0, 0),
  };

  if (box1.minX === box2.maxX) {
    // box2 is to the right of box1
    sharedEdge.right.y = Math.max(box1.minY, box2.minY);
    sharedEdge.right.x = box1.minX;
    sharedEdge.left.y = Math.min(box1.maxY, box2.maxY);
    sharedEdge.left.x = box1.minX;
  } else if (box1.maxX === box2.minX) {
    // box2 is to the left of box1
    sharedEdge.left.y = Math.max(box1.minY, box2.minY);
    sharedEdge.left.x = box2.minX;
    sharedEdge.right.y = Math.min(box1.maxY, box2.maxY);
    sharedEdge.right.x = box2.minX;
  } else if (box1.minY === box2.maxY) {
    // box2 is below box1
    sharedEdge.left.x = Math.max(box1.minX, box2.minX);
    sharedEdge.left.y = box1.minY;
    sharedEdge.right.x = Math.min(box1.maxX, box2.maxX);
    sharedEdge.right.y = box1.minY;
  } else if (box1.maxY === box2.minY) {
    // box2 is above box1
    sharedEdge.left.x = Math.min(box1.maxX, box2.maxX);
    sharedEdge.left.y = box2.minY;
    sharedEdge.right.x = Math.max(box1.minX, box2.minX);
    sharedEdge.right.y = box2.minY;
  }

  return sharedEdge;
}

export class QuadPathfinder {
  private maxDepth: number;
  private obstacles: PathfindingObstacle[];
  private bounds: Box2D;

  constructor({
    obstacles,
    bounds,
    maxDepth,
  }: {
    obstacles: PathfindingObstacle[];
    bounds: Box2D;
    maxDepth: number;
  }) {
    this.obstacles = obstacles;
    this.bounds = bounds;
    this.maxDepth = maxDepth;
  }

  findPath({
    start,
    end,
  }: {
    start: {
      x: number;
      y: number;
    };
    end: {
      x: number;
      y: number;
    };
  }) {
    const cells = new Map<number, CellDecomposition>();
    const root = new CellDecomposition({
      bbox: this.bounds,
      cells,
      depth: 0,
      maxDepth: this.maxDepth,
    });
    const quadGraph = new QuadGraph(root, cells);

    for (const obstacle of this.obstacles) {
      root.insert(obstacle);
    }

    const startCell = root.getLeaf(start);
    const endCell = root.getLeaf(end);

    if (!startCell || !endCell || startCell.occupied || endCell.occupied) {
      return {
        leaves: root.getLeaves(),
        path: null,
        smothPath: null,
        portals: null,
        pathCells: null,
      };
    }

    const path = aStar<number, Vector2>({
      start: startCell.getID(),
      end: endCell.getID(),
      graph: quadGraph,
      heuristic: (start, end) => start.distanceTo(end) ** 2,
    });

    if (!path) {
      return {
        leaves: root.getLeaves(),
        path: null,
        smothPath: null,
        portals: null,
        pathCells: null,
      };
    }

    const pathCells = path.map((nodeId) => cells.get(nodeId)!);
    const pathResult = pathCells.map((cell) => cell.bbox.center);
    const portals = getPortals(pathCells);

    if (portals.length === 0) {
      return {
        leaves: root.getLeaves(),
        path: null,
        smothPath: null,
        portals: null,
        pathCells: null,
      };
    }

    let smothPath: Vector2[] = [];

    if (startCell && endCell && !startCell.occupied && !endCell.occupied) {
      smothPath = [
        startCell.center,
        ...funnelPathSmoothing(pathResult, portals),
        endCell.center,
      ];
    }

    return {
      leaves: root.getLeaves(),
      path: pathResult,
      smothPath,
      portals,
      pathCells,
    };
  }
}
