import { World } from "./bodies/world";
import { QuadPathfinder } from "./quad-pathfinder";
import Render from "./render/render";
import { Scene } from "./scene";
import { Vector2 } from "./vector";

const render = new Render();

const worldBounds = {
  minX: 0,
  minY: 0,
  maxX: 1000,
  maxY: 1000,
};

const world = World.createRandomWorld({
  worldBounds: worldBounds,
  numberOfBodies: 10,
  size: 100,
  velocity: 0.5,
});

const scene = new Scene(render, world);

scene.onUpdate = () => {
  const result = QuadPathfinder.findPath({
    start: new Vector2(10, 10),
    end: new Vector2(worldBounds.maxX - 10, worldBounds.maxY - 10),
    obstacles: world.bodies,
    worldBounds,
  });

  if (!result) {
    return;
  }

  const { path, leaves, visited } = result;

  // Draw quadtree
  for (const cell of leaves) {
    if (cell.occupied) {
      render.fillRect(cell.bbox, `rgb(0, 255, 0)`);
    } else {
      render.strokeRect(cell.bbox, "white");
      render.fillCircle(cell.center.x, cell.center.y, 1, "red");
    }
  }

  // Draw path
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    render.drawLine(start.x, start.y, end.x, end.y, "blue", 2);
    render.fillCircle(start.x, start.y, 5, "blue");
  }

  // Draw visited
  for (const cell of visited) {
    render.fillCircle(cell.position.x, cell.position.y, 6, "green");
  }
};

scene.start();
