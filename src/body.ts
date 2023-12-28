import { Box2D } from "./box";
import { Vector2 } from "./vector";

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export class Body {
  box: Box2D;
  private velocity: Vector2;
  private worldBounds: Bounds;

  constructor({
    velocity,
    box,
    worldBounds,
  }: {
    velocity: Vector2;
    box: Box2D;
    worldBounds: Bounds;
  }) {
    this.velocity = velocity;
    this.box = box;
    this.worldBounds = worldBounds;
  }

  update() {
    this.box.x += this.velocity.x;
    this.box.y += this.velocity.y;
    this.checkThatBodyIsInsideWorldBounds();
  }

  private checkThatBodyIsInsideWorldBounds() {
    if (this.box.x + this.box.width > this.worldBounds.maxX) {
      this.velocity.x *= -1;
    }

    if (this.box.y + this.box.height > this.worldBounds.maxY) {
      this.velocity.y *= -1;
    }

    if (this.box.x < this.worldBounds.minX) {
      this.velocity.x *= -1;
    }

    if (this.box.y < this.worldBounds.minY) {
      this.velocity.y *= -1;
    }
  }
}
