import { Vector2, Mesh } from "three";
import { Box2D } from "./box";
import { createBoxIndicator } from "./render/render";

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export class Body {
  private velocity: Vector2;
  private box: Box2D;
  private worldBounds: Bounds;
  indicator: Mesh;

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
    this.indicator = createBoxIndicator(box);
  }

  update() {
    this.box.x += this.velocity.x;
    this.box.y += this.velocity.y;

    this.indicator.position.x = this.box.x + this.box.width / 2;
    this.indicator.position.z = this.box.y + this.box.height / 2;

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
