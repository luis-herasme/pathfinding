import { Vector2 } from "three";

export class Box2D {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;

  width: number;
  height: number;

  constructor(x: number, y: number, maxX: number, maxY: number) {
    this.minX = x;
    this.minY = y;
    this.maxX = maxX;
    this.maxY = maxY;
    this.width = maxX - x;
    this.height = maxY - y;
  }

  get center(): Vector2 {
    return new Vector2(this.minX + this.width / 2, this.minY + this.height / 2);
  }

  setPosition(x: number, y: number) {
    this.minX = x;
    this.minY = y;
    this.maxX = x + this.width;
    this.maxY = y + this.height;
  }

  containsPoint(point: { x: number; y: number }) {
    return (
      point.x >= this.minX &&
      point.x <= this.maxX &&
      point.y >= this.minY &&
      point.y <= this.maxY
    );
  }

  collideWithBox(box: Box2D) {
    return (
      this.minX < box.maxX &&
      this.maxX > box.minX &&
      this.minY < box.maxY &&
      this.maxY > box.minY
    );
  }

  containsBox(box: Box2D) {
    return (
      this.minX <= box.minX &&
      this.maxX >= box.maxX &&
      this.minY <= box.minY &&
      this.maxY >= box.maxY
    );
  }
}
