import { CellDecomposition, Obstacle } from "./cell-decomposition";
import { Box2D } from "./box";
import { QuadGraph } from "./quad-graph";
import { aStar } from "./pathfinding/a-star";
import { Bounds } from "./bodies/world";
import { Vector2 } from "./vector";
import { funnelPathSmoothing } from "./funnel";

function getPortals(path: CellDecomposition[]): {
  left: Vector2;
  right: Vector2;
}[] {
  const portals: {
    left: Vector2;
    right: Vector2;
  }[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const sharedEdge = getSharedEdge(path[i].bbox, path[i + 1].bbox);
    portals.push(sharedEdge);
  }

  return portals;
}

// Gets the shared edge between two boxes
function getSharedEdge(
  box1: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  box2: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
): {
  left: Vector2;
  right: Vector2;
} {
  const sharedEdge = {
    left: new Vector2(0, 0),
    right: new Vector2(0, 0),
  };

  const box1Right = box1.x + box1.width;
  const box1Bottom = box1.y + box1.height;

  const box2Right = box2.x + box2.width;
  const box2Bottom = box2.y + box2.height;

  if (box1.x === box2Right) {
    // box2 is to the right of box1
    sharedEdge.right.y = Math.max(box1.y, box2.y);
    sharedEdge.right.x = box1.x;
    sharedEdge.left.y = Math.min(box1Bottom, box2Bottom);
    sharedEdge.left.x = box1.x;
  } else if (box1Right === box2.x) {
    // box2 is to the left of box1
    sharedEdge.left.y = Math.max(box1.y, box2.y);
    sharedEdge.left.x = box2.x;
    sharedEdge.right.y = Math.min(box1Bottom, box2Bottom);
    sharedEdge.right.x = box2.x;
  } else if (box1.y === box2Bottom) {
    // box2 is below box1
    sharedEdge.left.x = Math.max(box1.x, box2.x);
    sharedEdge.left.y = box1.y;
    sharedEdge.right.x = Math.min(box1Right, box2Right);
    sharedEdge.right.y = box1.y;
  } else if (box1Bottom === box2.y) {
    // box2 is above box1
    sharedEdge.left.x = Math.min(box1Right, box2Right);
    sharedEdge.left.y = box2.y;
    sharedEdge.right.x = Math.max(box1.x, box2.x);
    sharedEdge.right.y = box2.y;
  }

  return sharedEdge;
}

export class QuadPathfinder {
  private maxDepth: number;
  private obstacles: Obstacle[];
  private bounds: Bounds;

  constructor({
    obstacles,
    bounds,
    maxDepth,
  }: {
    obstacles: Obstacle[];
    bounds: Bounds;
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
      bbox: new Box2D(
        this.bounds.minX,
        this.bounds.minY,
        this.bounds.maxX - this.bounds.minX,
        this.bounds.maxY - this.bounds.minY
      ),
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
      return null;
    }

    const path = aStar<number, Vector2>({
      start: startCell.getID(),
      end: endCell.getID(),
      graph: quadGraph,
      heuristic: (start, end) => start.distanceTo(end) ** 2,
      // invalidNodes: new Set(),
    });

    if (!path) {
      return null;
    }

    const pathCells = path.map((nodeId) => cells.get(nodeId)!);
    const pathResult = pathCells.map((cell) => cell.bbox.center);
    const portals = getPortals(pathCells);

    const smothPath = [
      startCell.center,
      ...funnelPathSmoothing(pathResult, portals),
      // Vector2.add(portals[portals.length - 1].left, portals[portals.length - 1].right).divideByScalar(2),
      endCell.center,
    ];

    // // Dispose of everything
    // cells.clear();

    return {
      path: pathResult,
      leaves: root.getLeaves(),
      smothPath,
      portals,
      pathCells,
    };
  }
}
