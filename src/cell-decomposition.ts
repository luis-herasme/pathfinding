import { Box2D } from "./box";
import { Vector2 } from "./vector";
import { Node, PathfindingGraph } from "./pathfinding/pathfinding-graph";

export class QuadGraph implements PathfindingGraph<number, Vector2> {
  private nodes: Map<number, Node<number, Vector2>>;
  private cells: Map<number, CellDecomposition<number>>;
  private root: CellDecomposition<number>;

  constructor(
    root: CellDecomposition<number>,
    cells: Map<number, CellDecomposition<number>>
  ) {
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

    const neighborCells: CellDecomposition<number>[] = [];
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

interface Obstacle {
  collideWithBox(box: Box2D): boolean;
  completelyContainsBox(box: Box2D): boolean;
}

function interleaveBits(x: number, y: number): number {
  let result = 0;
  for (let i = 0; 0 < x || 0 < y; i++) {
    if (x > 0) {
      result |= (x & 1) << (2 * i);
      x >>= 1;
    }
    if (y > 0) {
      result |= (y & 1) << (2 * i + 1);
      y >>= 1;
    }
  }
  return result;
}

export class CellDecomposition<NodeID> {
  bbox: Box2D;
  occupied: boolean = false;

  depth: number = 0;
  private divided: boolean = false;

  // Children
  private topLeft: CellDecomposition<NodeID> | null = null;
  private topRight: CellDecomposition<NodeID> | null = null;
  private bottomLeft: CellDecomposition<NodeID> | null = null;
  private bottomRight: CellDecomposition<NodeID> | null = null;

  cells: Map<NodeID, CellDecomposition<NodeID>>;
  maxDepth: number;
  constructor(
    bbox: Box2D,
    cells: Map<NodeID, CellDecomposition<NodeID>>,
    depth: number = 0,
    maxDepth: number = 8
  ) {
    this.bbox = bbox;
    this.depth = depth;
    this.maxDepth = maxDepth;
    this.cells = cells;
    this.cells.set(this.getID(), this);
  }

  getID(): NodeID {
    // return `${this.bbox.center.x},${this.bbox.center.y}` as  NodeID;
    return interleaveBits(
      this.bbox.center.x * 100,
      this.bbox.center.y * 100
    ) as NodeID;

    // return this.bbox.center as NodeID;
  }

  // Get the leave that contains the given point
  getLeaf(point: Vector2): CellDecomposition<NodeID> | null {
    if (!this.bbox.containsPoint(point)) {
      return null;
    }

    if (!this.divided) {
      return this;
    }

    if (this.topLeft) {
      const leaf = this.topLeft.getLeaf(point);

      if (leaf) {
        return leaf;
      }
    }

    if (this.topRight) {
      const leaf = this.topRight.getLeaf(point);

      if (leaf) {
        return leaf;
      }
    }

    if (this.bottomLeft) {
      const leaf = this.bottomLeft.getLeaf(point);

      if (leaf) {
        return leaf;
      }
    }

    if (this.bottomRight) {
      const leaf = this.bottomRight.getLeaf(point);

      if (leaf) {
        return leaf;
      }
    }

    return null;
  }

  getLeaves(leaves: CellDecomposition<NodeID>[]) {
    // Check if this is a leaf
    if (!this.divided) {
      leaves.push(this);
    }

    if (this.topLeft) {
      this.topLeft.getLeaves(leaves);
    }

    if (this.topRight) {
      this.topRight.getLeaves(leaves);
    }

    if (this.bottomLeft) {
      this.bottomLeft.getLeaves(leaves);
    }

    if (this.bottomRight) {
      this.bottomRight.getLeaves(leaves);
    }
  }

  getRegion(bbox: Box2D, cells: CellDecomposition<NodeID>[]) {
    if (!this.bbox.collideWithBox(bbox)) {
      return;
    }

    if (!this.occupied && !this.divided) {
      cells.push(this);
    }

    if (this.topLeft) {
      this.topLeft.getRegion(bbox, cells);
    }

    if (this.topRight) {
      this.topRight.getRegion(bbox, cells);
    }

    if (this.bottomLeft) {
      this.bottomLeft.getRegion(bbox, cells);
    }

    if (this.bottomRight) {
      this.bottomRight.getRegion(bbox, cells);
    }
  }

  private subdivide() {
    this.divided = true;

    const width = this.bbox.width / 2;
    const height = this.bbox.height / 2;

    this.topLeft = new CellDecomposition(
      new Box2D(this.bbox.x, this.bbox.y, width, height),
      this.cells,
      this.depth + 1,
      this.maxDepth
    );

    this.topRight = new CellDecomposition(
      new Box2D(this.bbox.x + width, this.bbox.y, width, height),
      this.cells,
      this.depth + 1,
      this.maxDepth
    );

    this.bottomLeft = new CellDecomposition(
      new Box2D(this.bbox.x, this.bbox.y + height, width, height),
      this.cells,
      this.depth + 1,
      this.maxDepth
    );

    this.bottomRight = new CellDecomposition(
      new Box2D(this.bbox.x + width, this.bbox.y + height, width, height),
      this.cells,
      this.depth + 1,
      this.maxDepth
    );
  }

  insert(item: Obstacle) {
    if (this.occupied) {
      return;
    }

    if (this.depth >= this.maxDepth) {
      if (item.collideWithBox(this.bbox)) {
        this.occupied = true;
      }

      return;
    }

    if (!item.collideWithBox(this.bbox)) {
      return;
    }

    if (item.completelyContainsBox(this.bbox) && !this.occupied && !this.divided) {
      this.occupied = true;
      return;
    }

    if (!this.divided) {
      this.subdivide();
    }

    if (this.topLeft) {
      this.topLeft.insert(item);
    }

    if (this.topRight) {
      this.topRight.insert(item);
    }

    if (this.bottomLeft) {
      this.bottomLeft.insert(item);
    }

    if (this.bottomRight) {
      this.bottomRight.insert(item);
    }
  }
}
