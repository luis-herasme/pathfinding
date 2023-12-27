import { Polygon } from "./polygon";
import { Vector2 } from "three";

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export class Body {
  private position: Vector2;
  private velocity: Vector2;
  private polygon: Polygon;
  private worldBounds: Bounds;

  constructor({
    velocity,
    polygon,
    worldBounds,
  }: {
    velocity: Vector2;
    polygon: Polygon;
    worldBounds: Bounds;
  }) {
    this.position = new Vector2(0, 0);
    this.velocity = velocity;
    this.polygon = polygon;
    this.worldBounds = worldBounds;
  }

  update() {
    this.position.add(this.velocity);
    this.polygon.setTranslation(this.position.x, this.position.y);
    this.checkThatBodyIsInsideWorldBounds();
  }

  private checkThatBodyIsInsideWorldBounds() {
    const bbox = this.polygon.computeBoundingBox();

    if (bbox.x + bbox.width > this.worldBounds.maxX) {
      this.velocity.x *= -1;
    }

    if (bbox.y + bbox.height > this.worldBounds.maxY) {
      this.velocity.y *= -1;
    }

    if (bbox.x < this.worldBounds.minX) {
      this.velocity.x *= -1;
    }

    if (bbox.y < this.worldBounds.minY) {
      this.velocity.y *= -1;
    }
  }
}
