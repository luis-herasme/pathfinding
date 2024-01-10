import { Box2D } from "../box";
import { Vector2 } from "three";
import { BoxBody } from "./box";
import { CircleBody } from "./circle";

export type Entity = BoxBody | CircleBody;

export class World {
  entities: Entity[] = [];

  constructor({ entities }: { entities: Entity[] }) {
    this.entities = entities;
  }

  update(dt: number) {
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].update(dt);
    }
  }

  static createRandomWorld({
    worldBounds,
    numberOfBodies,
    size,
    velocity,
  }: {
    worldBounds: Box2D;
    numberOfBodies: number;
    size: number;
    velocity: number;
  }) {
    const entities: Entity[] = [];

    for (let i = 0; i < numberOfBodies; i++) {
      const x = size + Math.random() * (worldBounds.maxX - 2 * size);
      const y = size + Math.random() * (worldBounds.maxY - 2 * size);

      if (Math.random() > 0.5) {
        entities.push(
          new BoxBody({
            velocity: new Vector2(
              velocity * (Math.random() - 0.5),
              velocity * (Math.random() - 0.5)
            ),
            box: new Box2D(
              x,
              y,
              x + size / 2 + (Math.random() * size) / 2,
              y + size / 2 + (Math.random() * size) / 2
            ),
            worldBounds,
          })
        );
      } else {
        entities.push(
          new CircleBody({
            velocity: new Vector2(
              velocity * (Math.random() - 0.5),
              velocity * (Math.random() - 0.5)
            ),
            radius: size / 2 + (Math.random() * size) / 2,
            position: new Vector2(x, y),
            worldBounds,
          })
        );
      }
    }

    return new World({ entities });
  }
}
