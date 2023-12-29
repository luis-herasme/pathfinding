import { Body } from "./body";
import { Box2D } from "./box";
import { Vector2 } from "./vector";

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export class World {
  bodies: Body[] = [];
  worldBounds: Bounds;

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

  getBoxes() {
    return this.bodies.map((body) => body.box);
  }

  update() {
    this.checkThatBodyIsInsideWorldBounds();

    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[i].update();
    }

    // for (let i = 0; i < this.bodies.length; i++) {
    //   for (let j = i + 1; j < this.bodies.length; j++) {
    //     if (i === j) {
    //       continue;
    //     }

    //     this.bodies[i].collide(this.bodies[j]);
    //   }
    // }
  }

  private checkThatBodyIsInsideWorldBounds() {
    for (let i = 0; i < this.bodies.length; i++) {
      const body = this.bodies[i];

      if (body.box.x + body.box.width > this.worldBounds.maxX) {
        body.velocity.x *= -1;
      }

      if (body.box.y + body.box.height > this.worldBounds.maxY) {
        body.velocity.y *= -1;
      }

      if (body.box.x < this.worldBounds.minX) {
        body.velocity.x *= -1;
      }

      if (body.box.y < this.worldBounds.minY) {
        body.velocity.y *= -1;
      }
    }
  }

  static createRandomWorld({
    worldBounds,
    numberOfBodies,
    size,
    velocity,
  }: {
    worldBounds: Bounds;
    numberOfBodies: number;
    size: number;
    velocity: number;
  }) {
    const bodies: Body[] = [];

    for (let i = 0; i < numberOfBodies; i++) {
      const x = size + Math.random() * (worldBounds.maxX - 2 * size);
      const y = size + Math.random() * (worldBounds.maxY - 2 * size);

      const body = new Body({
        velocity: Vector2.random(velocity),
        box: new Box2D(x, y, size, size),
      });

      bodies.push(body);
    }

    const world = new World({ worldBounds, bodies });

    return world;
  }
}
