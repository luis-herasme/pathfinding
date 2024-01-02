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
  static findPath({
    start,
    end,
    obstacles,
    worldBounds,
  }: {
    start: Vector2;
    end: Vector2;
    obstacles: Obstacle[];
    worldBounds: Bounds;
  }) {
    const cells = new Map<number, CellDecomposition>();
    const root = new CellDecomposition({
      bbox: new Box2D(0, 0, worldBounds.maxX, worldBounds.maxY),
      cells,
      depth: 0,
      maxDepth: 6,
    });
    const quadGraph = new QuadGraph(root, cells);

    for (const obstacle of obstacles) {
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
      heuristic: (start, end) => start.distanceTo(end),
      invalidNodes: new Set(),
    });

    if (!path) {
      return null;
    }

    const pathResult = path.map((nodeId) => cells.get(nodeId)!.bbox.center);
    // pathResult.unshift(start);
    // pathResult.push(end);
    const portals = getPortals(path.map((nodeId) => cells.get(nodeId)!));
    return {
      path: pathResult,
      leaves: root.getLeaves(),
      visited: [],
      smothPath: [
        startCell.center,
        ...funnelPathSmoothing(pathResult, portals),
        // Vector2.add(portals[portals.length - 1].left, portals[portals.length - 1].right).divideByScalar(2),
        endCell.center,
      ],
      portals,
      // visited: Array.from(quadGraph.nodes.values()).filter(
      //   (node) => node.visited
      // ),
    };
  }
}
