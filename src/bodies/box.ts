import { Box2D } from "../box";
import { Vector2 } from "../vector";
import { Bounds, Body } from "./world";
import { Obstacle } from "../cell-decomposition";
import { createBoxIndicator } from "../render3d/render";

export class BoxBody implements Obstacle, Body {
  box: Box2D;
  velocity: Vector2;
  position: Vector2;
  indicator: THREE.Mesh;

  constructor({ velocity, box }: { velocity: Vector2; box: Box2D }) {
    this.velocity = velocity;
    this.box = box;
    this.position = new Vector2(box.x, box.y);
    this.indicator = createBoxIndicator(box);
  }

  update(dt: number) {
    this.position.add(this.velocity.clone().multiplyByScalar(dt));

    this.box.x = this.position.x;
    this.box.y = this.position.y;

    this.indicator.position.set(this.position.x, 1, this.position.y);
  }

  collideWithBox(box: Box2D) {
    return this.box.collideWithBox(box);
  }

  completelyContainsBox(box: Box2D) {
    return this.box.containsBox(box);
  }

  collideWithWorldBounds(worldBounds: Bounds) {
    if (this.box.x + this.box.width > worldBounds.maxX) {
      this.velocity.x *= -1;
      this.box.x = worldBounds.maxX - this.box.width;
    }

    if (this.box.y + this.box.height > worldBounds.maxY) {
      this.velocity.y *= -1;
      this.box.y = worldBounds.maxY - this.box.height;
    }

    if (this.box.x < worldBounds.minX) {
      this.velocity.x *= -1;
      this.box.x = worldBounds.minX;
    }

    if (this.box.y < worldBounds.minY) {
      this.velocity.y *= -1;
      this.box.y = worldBounds.minY;
    }
  }
}
