import { Box2D } from "../box";
import { Vector2 } from "three";
import { PathfindingObstacle } from "../cell-decomposition";
import { createBoxIndicator } from "../render";

export class BoxBody implements PathfindingObstacle {
  box: Box2D;
  velocity: Vector2;
  position: Vector2;
  indicator: THREE.Mesh;
  worldBounds: Box2D;

  constructor({
    velocity,
    box,
    worldBounds,
  }: {
    velocity: Vector2;
    box: Box2D;
    worldBounds: Box2D;
  }) {
    this.box = box;
    this.velocity = velocity;
    this.position = new Vector2(box.minX, box.minY);
    this.worldBounds = worldBounds;
    this.indicator = createBoxIndicator(box);
  }

  update(dt: number) {
    this.position.add(this.velocity.clone().multiplyScalar(dt));
    this.box.setPosition(this.position.x, this.position.y);
    this.indicator.position.set(this.position.x, 1, this.position.y);
    this.collideWithWorldBounds(this.worldBounds);
  }

  collideWithBox(box: Box2D) {
    return this.box.collideWithBox(box);
  }

  completelyContainsBox(box: Box2D) {
    return this.box.containsBox(box);
  }

  private collideWithWorldBounds(worldBounds: Box2D) {
    if (this.box.minX + this.box.width > worldBounds.maxX) {
      this.velocity.x *= -1;
      this.box.minX = worldBounds.maxX - this.box.width;
      this.position.x = this.box.minX;
    }

    if (this.box.minY + this.box.height > worldBounds.maxY) {
      this.velocity.y *= -1;
      this.box.minY = worldBounds.maxY - this.box.height;
      this.position.y = this.box.minY;
    }

    if (this.box.minX < worldBounds.minX) {
      this.velocity.x *= -1;
      this.box.minX = worldBounds.minX;
      this.position.x = this.box.minX;
    }

    if (this.box.minY < worldBounds.minY) {
      this.velocity.y *= -1;
      this.box.minY = worldBounds.minY;
      this.position.y = this.box.minY;
    }
  }
}
