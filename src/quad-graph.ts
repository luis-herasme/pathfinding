import { Box2D } from "./box";
import { Vector2 } from "./vector";
import { CellDecomposition } from "./cell-decomposition";
import { Node, PathfindingGraph } from "./pathfinding/pathfinding-graph";

export class QuadGraph implements PathfindingGraph<number, Vector2> {
  nodes: Map<number, Node<number, Vector2>>;
  private cells: Map<number, CellDecomposition>;
  private root: CellDecomposition;

  constructor(root: CellDecomposition, cells: Map<number, CellDecomposition>) {
    this.nodes = new Map();
    this.cells = cells;
    this.root = root;
  }

  get(nodeId: number): Node<number, Vector2> | null {
    if (this.nodes.has(nodeId)) {
      return this.nodes.get(nodeId)!;
    }

    const cell = this.cells.get(nodeId);

    if (!cell) {
      return null;
    }

    const neighbors = this.getNeighbors(cell.bbox);

    const node = {
      visited: false,
      position: cell.bbox.center,
      neighbors,
    };

    this.nodes.set(nodeId, node);
    return node;
  }

  private getNeighbors(bbox: Box2D): {
    nodeId: number;
    weight: number;
  }[] {
    const neighborsBBOX = new Box2D(
      bbox.x - 1,
      bbox.y - 1,
      bbox.width + 2,
      bbox.height + 2
    );

    const neighborCells: CellDecomposition[] = [];
    this.root.getRegion(neighborsBBOX, neighborCells);
    const center = bbox.center;

    const neighbors: {
      nodeId: number;
      weight: number;
    }[] = [];

    for (const cell of neighborCells) {
      if (cell.occupied) {
        continue;
      }

      const neighborCenter = cell.bbox.center;

      neighbors.push({
        nodeId: cell.getID(),
        weight: center.distanceTo(neighborCenter),
      });
    }

    return neighbors;
  }
}
