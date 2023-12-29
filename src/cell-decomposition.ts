import { Box2D } from "./box";
import { Vector2 } from "./vector";
import { Node, PathfindingGraph } from "./pathfinding/pathfinding-graph";

const MAX_DEPTH = 7;

export class QuadGraph implements PathfindingGraph<string, Vector2> {
  nodes: Map<string, Node<string, Vector2>> = new Map();
  private root: CellDecomposition;
  private cells: Map<string, CellDecomposition>;

  constructor(root: CellDecomposition, cells: Map<string, CellDecomposition>) {
    this.root = root;
    this.cells = cells;
  }

  get(nodeId: string): Node<string, Vector2> | null {
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
    nodeId: string;
    weight: number;
  }[] {
    const neighborsBBOX = new Box2D(
      bbox.x - 1,
      bbox.y - 1,
      bbox.width + 2,
      bbox.height + 2
    );

    const neighbors: {
      nodeId: string;
      weight: number;
    }[] = [];

    const neighborCells: CellDecomposition[] = [];
    this.root.getRegion(neighborsBBOX, neighborCells);
    const center = bbox.center;

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

export class CellDecomposition {
  bbox: Box2D;
  occupied: boolean = false;

  depth: number = 0;
  private divided: boolean = false;

  // Children
  private topLeft: CellDecomposition | null = null;
  private topRight: CellDecomposition | null = null;
  private bottomLeft: CellDecomposition | null = null;
  private bottomRight: CellDecomposition | null = null;

  cells: Map<string, CellDecomposition>;

  constructor(
    bbox: Box2D,
    cells: Map<string, CellDecomposition>,
    depth: number = 0
  ) {
    this.bbox = bbox;
    this.depth = depth;
    this.cells = cells;
    this.cells.set(this.getID(), this);
  }

  getID() {
    return `${this.bbox.center.x},${this.bbox.center.y}`;
  }

  // Get the leave that contains the given point
  getLeaf(point: Vector2): CellDecomposition | null {
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

  getLeaves(leaves: CellDecomposition[]) {
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

  getRegion(bbox: Box2D, cells: CellDecomposition[]) {
    if (!collide(this.bbox, bbox)) {
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

  subdivide() {
    this.divided = true;

    const width = this.bbox.width / 2;
    const height = this.bbox.height / 2;

    this.topLeft = new CellDecomposition(
      new Box2D(this.bbox.x, this.bbox.y, width, height),
      this.cells,
      this.depth + 1
    );

    this.topRight = new CellDecomposition(
      new Box2D(this.bbox.x + width, this.bbox.y, width, height),
      this.cells,
      this.depth + 1
    );

    this.bottomLeft = new CellDecomposition(
      new Box2D(this.bbox.x, this.bbox.y + height, width, height),
      this.cells,
      this.depth + 1
    );

    this.bottomRight = new CellDecomposition(
      new Box2D(this.bbox.x + width, this.bbox.y + height, width, height),
      this.cells,
      this.depth + 1
    );
  }

  insert(box: Box2D) {
    if (this.depth >= MAX_DEPTH) {
      if (collide(this.bbox, box)) {
        this.occupied = true;
      }

      return;
    }

    if (!collide(this.bbox, box)) {
      return;
    }

    if (!this.divided) {
      this.subdivide();
    }

    if (this.topLeft) {
      this.topLeft.insert(box);
    }

    if (this.topRight) {
      this.topRight.insert(box);
    }

    if (this.bottomLeft) {
      this.bottomLeft.insert(box);
    }

    if (this.bottomRight) {
      this.bottomRight.insert(box);
    }
  }
}

function collide(b1: Box2D, b2: Box2D) {
  return (
    b1.x < b2.x + b2.width &&
    b1.x + b1.width > b2.x &&
    b1.y < b2.y + b2.height &&
    b1.y + b1.height > b2.y
  );
}
