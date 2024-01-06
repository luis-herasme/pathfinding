import { Vector2 } from "../vector";
import { Obstacle } from "../cell-decomposition";

export type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type Body = {
  position: Vector2;
  velocity: Vector2;
  update(): void;
  collideWithWorldBounds(worldBounds: Bounds): void;
} & Obstacle;

export class World {
  bodies: Body[] = [];
  private worldBounds: Bounds;

  constructor({
    worldBounds,
    bodies,
  }: {
    worldBounds: Bounds;
    bodies: Body[];
  }) {
    this.bodies = bodies;
    this.worldBounds = worldBounds;
  }

  addBody(body: Body) {
    this.bodies.push(body);
  }

  update() {
    this.checkThatBodyIsInsideWorldBounds();

    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[i].update();
    }
  }

  private checkThatBodyIsInsideWorldBounds() {
    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[i].collideWithWorldBounds(this.worldBounds);
    }
  }
}
