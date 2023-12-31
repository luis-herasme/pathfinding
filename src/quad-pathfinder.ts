import { CellDecomposition, Obstacle } from "./cell-decomposition";
import { Box2D } from "./box";
import { QuadGraph } from "./quad-graph";
import { aStar } from "./pathfinding/a-star";
import { Bounds } from "./bodies/world";
import { Vector2 } from "./vector";

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
      maxDepth: 10,
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
      heuristic: (start, end) => start.distanceTo(end) ** 2,
      invalidNodes: new Set(),
    });

    if (!path) {
      return null;
    }

    const pathResult = path.map((nodeId) => cells.get(nodeId)!.bbox.center);
    pathResult.unshift(start);
    pathResult.push(end);

    return {
      path: pathResult,
      leaves: root.getLeaves(),
      visited: [],
      // visited: Array.from(quadGraph.nodes.values()).filter(
      //   (node) => node.visited
      // ),
    };
  }
}
