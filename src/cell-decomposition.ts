import { Box2D } from "./box";
import { Vector2 } from "./vector";

export interface Obstacle {
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

export class CellDecomposition {
  bbox: Box2D;
  occupied: boolean = false;

  private maxDepth: number;
  private depth: number = 0;
  private divided: boolean = false;
  private cells: Map<number, CellDecomposition>;

  // Children
  private topLeft: CellDecomposition | null = null;
  private topRight: CellDecomposition | null = null;
  private bottomLeft: CellDecomposition | null = null;
  private bottomRight: CellDecomposition | null = null;

  constructor(
    bbox: Box2D,
    cells: Map<number, CellDecomposition>,
    depth: number = 0,
    maxDepth: number = 8
  ) {
    this.bbox = bbox;
    this.depth = depth;
    this.maxDepth = maxDepth;
    this.cells = cells;
    this.cells.set(this.getID(), this);
  }

  getID(): number {
    return interleaveBits(this.bbox.center.x * 100, this.bbox.center.y * 100);
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

    if (
      item.completelyContainsBox(this.bbox) &&
      !this.occupied &&
      !this.divided
    ) {
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