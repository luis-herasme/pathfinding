import { Vector2 } from "./vector";

export class Box2D {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get center(): Vector2 {
    return new Vector2(this.x + this.width / 2, this.y + this.height / 2);
  }

  containsPoint(point: { x: number; y: number }) {
    return (
      point.x >= this.x &&
      point.x <= this.x + this.width &&
      point.y >= this.y &&
      point.y <= this.y + this.height
    );
  }

  collideWithBox(box: Box2D) {
    return (
      this.x < box.x + box.width &&
      this.x + this.width > box.x &&
      this.y < box.y + box.height &&
      this.y + this.height > box.y
    );
  }

  containsBox(box: Box2D) {
    return (
      this.x <= box.x &&
      this.x + this.width >= box.x + box.width &&
      this.y <= box.y &&
      this.y + this.height >= box.y + box.height
    );
  }

  collisions(boxes: Box2D): {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  } {
    return {
      top: this.y < boxes.y + boxes.height && this.y > boxes.y,
      bottom: this.y + this.height > boxes.y && this.y + this.height < boxes.y,
      left: this.x < boxes.x + boxes.width && this.x > boxes.x,
      right: this.x + this.width > boxes.x && this.x + this.width < boxes.x,
    };
  }

  getVertices(): [number, number][] {
    // return [
    //   [this.x, this.y],
    //   [this.x + this.width, this.y],
    //   [this.x + this.width, this.y + this.height],
    //   [this.x, this.y + this.height],
    // ];
    const PADDING = 5;

    return [
      [this.x + PADDING, this.y + PADDING],
      [this.x + this.width - PADDING, this.y + PADDING],
      [this.x + this.width - PADDING, this.y + this.height - PADDING],
      [this.x + PADDING, this.y + this.height - PADDING],
    ];
  }
}
