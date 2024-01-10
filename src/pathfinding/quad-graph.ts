import { Box2D } from "../box";
import { Vector2 } from "three";
import { NavQuadtree } from "./nav-quadtree";
import { Node, PathfindingGraph } from "./pathfinding-graph";

export class QuadGraph implements PathfindingGraph<number, Vector2> {
  nodes: Map<number, Node<number, Vector2>>;
  private cells: Map<number, NavQuadtree>;
  private root: NavQuadtree;

  constructor(root: NavQuadtree, cells: Map<number, NavQuadtree>) {
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

    const neighbors = this.getFreeNeighbors(cell.bbox);

    const node = {
      position: cell.bbox.center,
      neighbors,
    };

    this.nodes.set(nodeId, node);
    return node;
  }

  private getFreeNeighbors(bbox: Box2D): {
    nodeId: number;
    weight: number;
  }[] {
    const neighborsBoxLeft = new Box2D(
      bbox.minX - 1,
      bbox.minY,
      bbox.minX,
      bbox.maxY
    );

    const neighborsBoxRight = new Box2D(
      bbox.maxX,
      bbox.minY,
      bbox.maxX + 1,
      bbox.maxY
    );

    const neighborsBoxTop = new Box2D(
      bbox.minX,
      bbox.minY - 1,
      bbox.maxX,
      bbox.minY
    );

    const neighborsBoxBottom = new Box2D(
      bbox.minX,
      bbox.maxY,
      bbox.maxX,
      bbox.maxY + 1
    );

    const neighborCells: NavQuadtree[] = [];
    this.root.getRegion(neighborsBoxLeft, neighborCells);
    this.root.getRegion(neighborsBoxTop, neighborCells);
    this.root.getRegion(neighborsBoxRight, neighborCells);
    this.root.getRegion(neighborsBoxBottom, neighborCells);
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

  set(nodeId: number, node: Node<number, Vector2>): void {
    this.nodes.set(nodeId, node);
  }
}
