import { Box2D } from "../box";
import { Vector2 } from "three";
import { PathfindingObstacle } from "../pathfinding/nav-quadtree";
import { createCylinderIndicator } from "../visualizers/basic-indicators";

export class CircleBody implements PathfindingObstacle {
  radius: number;
  position: Vector2;
  velocity: Vector2;
  indicator: THREE.Mesh;
  worldBounds: Box2D;

  constructor({
    radius,
    position,
    velocity,
    worldBounds,
  }: {
    radius: number;
    position: Vector2;
    velocity: Vector2;
    worldBounds: Box2D;
  }) {
    this.radius = radius;
    this.position = position;
    this.velocity = velocity;
    this.worldBounds = worldBounds;
    this.indicator = createCylinderIndicator(radius);
  }

  collideWithBox(box: Box2D) {
    const closestX = Math.max(
      box.minX,
      Math.min(this.position.x, box.minX + box.width)
    );

    const closestY = Math.max(
      box.minY,
      Math.min(this.position.y, box.minY + box.height)
    );

    const distanceX = this.position.x - closestX;
    const distanceY = this.position.y - closestY;

    return (
      distanceX * distanceX + distanceY * distanceY < this.radius * this.radius
    );
  }

  completelyContainsBox(box: Box2D) {
    const rectCorners = [
      [box.minX, box.minY],
      [box.maxX, box.minY],
      [box.minX, box.maxY],
      [box.maxX, box.maxY],
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

  private collideWithWorldBounds(worldBounds: Box2D): void {
    if (this.position.x + this.radius > worldBounds.maxX) {
      this.velocity.x *= -1;
      this.position.x = worldBounds.maxX - this.radius;
    }

    if (this.position.y + this.radius > worldBounds.maxY) {
      this.velocity.y *= -1;
      this.position.y = worldBounds.maxY - this.radius;
    }

    if (this.position.x - this.radius < worldBounds.minX) {
      this.velocity.x *= -1;
      this.position.x = worldBounds.minX + this.radius;
    }

    if (this.position.y - this.radius < worldBounds.minY) {
      this.velocity.y *= -1;
      this.position.y = worldBounds.minY + this.radius;
    }
  }

  update(dt: number) {
    this.position.add(this.velocity.clone().multiplyScalar(dt));
    this.indicator.position.set(this.position.x, 1, this.position.y);

    this.collideWithWorldBounds(this.worldBounds);
  }
}
