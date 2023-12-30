import { Box2D } from "../box";
import { Obstacle } from "../cell-decomposition";
import Render from "../render/render";
import { Vector2 } from "../vector";
import { Body, Bounds } from "./world";

export class CircleBody implements Obstacle, Body {
  radius: number;
  position: Vector2;
  velocity: Vector2;

  constructor({
    radius,
    position,
    velocity,
  }: {
    radius: number;
    position: Vector2;
    velocity: Vector2;
  }) {
    this.radius = radius;
    this.position = position;
    this.velocity = velocity;
  }

  collideWithBox(box: Box2D) {
    const closestX = Math.max(
      box.x,
      Math.min(this.position.x, box.x + box.width)
    );
    const closestY = Math.max(
      box.y,
      Math.min(this.position.y, box.y + box.height)
    );

    const distanceX = this.position.x - closestX;
    const distanceY = this.position.y - closestY;

    return (
      distanceX * distanceX + distanceY * distanceY < this.radius * this.radius
    );
  }

  completelyContainsBox(box: Box2D) {
    return (
      this.position.x - this.radius <= box.x &&
      this.position.x + this.radius >= box.x + box.width &&
      this.position.y - this.radius <= box.y &&
      this.position.y + this.radius >= box.y + box.height
    );
  }

  collideWithWorldBounds(worldBounds: Bounds): void {
    if (this.position.x + this.radius > worldBounds.maxX) {
      this.velocity.x *= -1;
    }

    if (this.position.y + this.radius > worldBounds.maxY) {
      this.velocity.y *= -1;
    }

    if (this.position.x - this.radius < worldBounds.minX) {
      this.velocity.x *= -1;
    }

    if (this.position.y - this.radius < worldBounds.minY) {
      this.velocity.y *= -1;
    }
  }

  update() {
    this.position.add(this.velocity);
  }

  render(renderer: Render): void {
    renderer.fillCircle(
      this.position.x,
      this.position.y,
      this.radius,
      "rgba(255, 0, 0, 0.5)"
    );
  }
}
