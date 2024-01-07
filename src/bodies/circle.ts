import { Box2D } from "../box";
import { Vector2 } from "../vector";
import { Body, Bounds } from "./world";
import { Obstacle } from "../cell-decomposition";
import { createCylinderIndicator } from "../render3d/render";

export class CircleBody implements Obstacle, Body {
  radius: number;
  position: Vector2;
  velocity: Vector2;
  indicator: THREE.Group;

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
    this.indicator = createCylinderIndicator({
      x: position.x,
      y: position.y,
      radius,
    });
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
    const rectCorners = [
      [box.x, box.y],
      [box.x + box.width, box.y],
      [box.x, box.y + box.height],
      [box.x + box.width, box.y + box.height],
    ];

    for (const corner of rectCorners) {
      const dist =
        Math.pow(corner[0] - this.position.x, 2) +
        Math.pow(corner[1] - this.position.y, 2);

      if (dist > Math.pow(this.radius, 2)) {
        return false;
      }
    }

    return true;
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
    this.indicator.position.set(this.position.x, 1, this.position.y);
  }
}
