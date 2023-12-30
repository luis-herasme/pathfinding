import { Box2D } from "../box";
import { Obstacle } from "../cell-decomposition";
import Render from "../render/render";
import { Vector2 } from "../vector";
import { Bounds, Body } from "./world";

export class BoxBody implements Obstacle, Body {
  box: Box2D;
  velocity: Vector2;
  position: Vector2;

  constructor({ velocity, box }: { velocity: Vector2; box: Box2D }) {
    this.velocity = velocity;
    this.box = box;
    this.position = new Vector2(box.x, box.y);
  }

  update() {
    this.position.add(this.velocity);

    this.box.x = this.position.x;
    this.box.y = this.position.y;
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
    }

    if (this.box.y + this.box.height > worldBounds.maxY) {
      this.velocity.y *= -1;
    }

    if (this.box.x < worldBounds.minX) {
      this.velocity.x *= -1;
    }

    if (this.box.y < worldBounds.minY) {
      this.velocity.y *= -1;
    }
  }

  render(renderer: Render) {
    renderer.fillRect(this.box, "rgba(255, 0, 0, 0.5)");
  }
}
