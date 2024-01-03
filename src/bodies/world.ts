import { Box2D } from "../box";
import { Obstacle } from "../cell-decomposition";
import Render from "../render/render";
import { Vector2 } from "../vector";
import { BoxBody } from "./box";
import { CircleBody } from "./circle";

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
  render(renderer: Render): void;
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
    // bodies.push(
    //   new CircleBody({
    //     radius: 100,
    //     position: new Vector2(100, 100),
    //     velocity: new Vector2(0, 0),
    //   })
    // );
    for (let i = 0; i < numberOfBodies; i++) {
      const x = size + Math.random() * (worldBounds.maxX - 2 * size);
      const y = size + Math.random() * (worldBounds.maxY - 2 * size);

      if (Math.random() > 0.5) {
        bodies.push(
          new BoxBody({
            velocity: Vector2.random(velocity),
            box: new Box2D(
              x,
              y,
              size / 2 + (Math.random() * size) / 2,
              size / 2 + (Math.random() * size) / 2
            ),
          })
        );
      } else {
        bodies.push(
          new CircleBody({
            velocity: Vector2.random(velocity),
            radius: size / 2 + (Math.random() * size) / 2,
            position: new Vector2(x, y),
          })
        );
      }
    }

    return new World({ worldBounds, bodies });
  }
}
