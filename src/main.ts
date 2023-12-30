import { World } from "./world";
import Render from "./render/render";
import { triangulate } from "./navmesh/triangle";
import Stats from "stats.js";
import { CellDecomposition, QuadGraph } from "./cell-decomposition";
import { Box2D } from "./box";
import { aStar } from "./pathfinding/a-star";
import { Vector2 } from "./vector";
import { BoxBody } from "./body";

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);
const render = new Render();

const WORLD_BOUNDS = {
  minX: 0,
  minY: 0,
  maxX: 1000,
  maxY: 1000,
};

const WORLD_VERTICES = [
  WORLD_BOUNDS.minX,
  WORLD_BOUNDS.minY,
  WORLD_BOUNDS.maxX,
  WORLD_BOUNDS.minY,
  WORLD_BOUNDS.maxX,
  WORLD_BOUNDS.maxY,
  WORLD_BOUNDS.minX,
  WORLD_BOUNDS.maxY,
];

const world = World.createRandomWorld({
  worldBounds: WORLD_BOUNDS,
  numberOfBodies: 30,
  size: 50,
  velocity: 0.5,
});

// const centerBody = new Body({
//   box: new Box2D(250, 250, 500, 500),
//   velocity: new Vector2(0, 0),
// });

// world.addBody(centerBody);

// function generateWorldMesh() {
//   const boxes = world.getBoxes();
//   const holeIndices: number[] = [];
//   let holeIndicesCount = WORLD_VERTICES.length / 2;

//   for (let i = 0; i < boxes.length; i++) {
//     holeIndices.push(holeIndicesCount);
//     holeIndicesCount = holeIndicesCount + boxes[i].getVertices().length;
//   }

//   const holes = boxes.map((box) => box.getVertices().flat()).flat();
//   const flatData = [...WORLD_VERTICES, ...holes];
//   const triangles = triangulate(flatData, holeIndices);
//   return triangles;
// }

render.init();

class CameraBody {
  public render: Render;
  public position: Vector2 = new Vector2(0, 0);
  public velocity: Vector2 = new Vector2(0, 0);
  public acceleration: Vector2 = new Vector2(0, 0);

  constructor(render: Render) {
    this.render = render;
  }

  addForce(force: Vector2) {
    this.acceleration.add(force);
  }

  update(dt: number) {
    this.velocity.add(this.acceleration);
    this.position.add(Vector2.multiplyByScalar(this.velocity, dt));
    this.acceleration.multiplyByScalar(0);

    if (this.velocity.magnitude() < 10) {
      this.velocity.multiplyByScalar(0);
      return;
    }

    // Calculate friction
    const frictionCoefficient = 4000;
    const friction = this.velocity
      .clone()
      .normalize()
      .multiplyByScalar(-frictionCoefficient * dt);

    this.velocity.add(friction);
    render.setTranslation(this.position.x, this.position.y);
  }
}

const cameraBody = new CameraBody(render);
const keysDown = new Set<string>();

const mouse = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("keypress", (e) => {
  keysDown.add(e.key);
});

window.addEventListener("keyup", (e) => {
  keysDown.delete(e.key);
});

let scale = 1;

// window.addEventListener("wheel", (e) => {
//   render.context.scale(1 / scale, 1 / scale);

//   if (e.deltaY > 0) {
//     scale *= 1.1;
//   } else {
//     scale *= 0.9;
//   }

//   if (scale < 1) {
//     scale = 1;
//   }

//   if (scale > 2) {
//     scale = 2;
//   }

//   render.context.translate(
//     cameraBody.position.x + mouse.x * scale,
//     cameraBody.position.y + mouse.y * scale
//   );

//   render.context.scale(scale, scale);

//   render.context.translate(
//     -(cameraBody.position.x + mouse.x * scale),
//     -(cameraBody.position.y + mouse.y * scale)
//   );
// });

function getTransformedPoint(x: number, y: number) {
  const originalPoint = new DOMPoint(x, y);
  return render.context
    .getTransform()
    .invertSelf()
    .transformPoint(originalPoint);
}
window.addEventListener("wheel", onWheel);

function onWheel(event: WheelEvent) {
  const currentTransformedCursor = getTransformedPoint(
    event.offsetX,
    event.offsetY
  );

  const zoom = event.deltaY < 0 ? 1.1 : 0.9;

  render.context.translate(
    currentTransformedCursor.x,
    currentTransformedCursor.y
  );

  render.context.scale(zoom, zoom);

  render.context.translate(
    -currentTransformedCursor.x,
    -currentTransformedCursor.y
  );
}

let lastTime = Date.now();
const CAMERA_SPEED = 6000;

function update() {
  const currentTime = Date.now();
  const dt = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (keysDown.has("w")) {
    cameraBody.addForce(new Vector2(0, CAMERA_SPEED * dt));
  }

  if (keysDown.has("s")) {
    cameraBody.addForce(new Vector2(0, -CAMERA_SPEED * dt));
  }

  if (keysDown.has("a")) {
    cameraBody.addForce(new Vector2(CAMERA_SPEED * dt, 0));
  }

  if (keysDown.has("d")) {
    cameraBody.addForce(new Vector2(-CAMERA_SPEED * dt, 0));
  }

  cameraBody.update(dt);
  stats.begin();
  world.update();
  render.clear();

  // const triangles = generateWorldMesh();

  // for (const triangle of triangles) {
  //   const green = Math.round((255 * triangle.center.x) / WORLD_BOUNDS.maxX);
  //   const blue = Math.round((255 * triangle.center.y) / WORLD_BOUNDS.maxY);
  //   const color = `rgb(0, ${green}, ${blue})`;
  //   render.drawTriangle(triangle, color);
  // }

  const cells = new Map<number, CellDecomposition<number>>();
  const rootCell = new CellDecomposition<number>(
    new Box2D(0, 0, WORLD_BOUNDS.maxX, WORLD_BOUNDS.maxY),
    cells,
    0,
    6
  );
  const quadGraph = new QuadGraph(rootCell, cells);

  for (const body of world.bodies) {
    rootCell.insert(body);
  }

  const leaves: CellDecomposition<number>[] = [];
  rootCell.getLeaves(leaves);

  for (const cell of leaves) {
    if (cell.occupied) {
      render.fillRect(cell.bbox, `rgb(0, 255, 0)`);
    } else {
      render.strokeRect(cell.bbox, "white");
      render.fillCircle(
        cell.bbox.x + cell.bbox.width / 2,
        cell.bbox.y + cell.bbox.height / 2,
       1,
        "red"
      );
    }
  }

  const startPoint = new Vector2(10, 10);
  const endPoint = new Vector2(WORLD_BOUNDS.maxX - 10, WORLD_BOUNDS.maxY - 10);
  const startCell = rootCell.getLeaf(startPoint)!;
  const endCell = rootCell.getLeaf(endPoint)!;

  if (!startCell.occupied && !endCell.occupied) {
    const path = aStar<number, Vector2>({
      start: startCell.getID(),
      end: endCell.getID(),
      graph: quadGraph,
      heuristic: (start, end) => start.distanceTo(end) ** 2,
      invalidNodes: new Set(),
    });
    if (path) {
      const pathCells = path.map((nodeId) => cells.get(nodeId)!);

      render.fillCircle(startPoint.x, startPoint.y, 5, "red");
      render.drawLine(
        startPoint.x,
        startPoint.y,
        pathCells[0].bbox.center.x,
        pathCells[0].bbox.center.y,
        "red",
        2
      );
      render.fillCircle(endPoint.x, endPoint.y, 5, "red");
      render.drawLine(
        endPoint.x,
        endPoint.y,
        pathCells[pathCells.length - 1].bbox.center.x,
        pathCells[pathCells.length - 1].bbox.center.y,
        "red",
        2
      );

      for (let i = 0; i < pathCells.length - 1; i++) {
        const start = pathCells[i].bbox.center;
        const end = pathCells[i + 1].bbox.center;
        render.drawLine(start.x, start.y, end.x, end.y, "blue", 2);
        render.fillCircle(start.x, start.y, 5, "blue");
      }

      // Draw visited
      // for (const cell of quadGraph.nodes.values()) {
      //   if (cell.visited) {
      //     render.fillCircle(cell.position.x, cell.position.y, 6, "green");
      //   }
      // }
    } else {
      console.log("No path found");
    }
  } else {
    console.log("Start or end cell is occupied");
  }

  // Draw world bounds
  render.strokeRect(
    new Box2D(
      WORLD_BOUNDS.minX,
      WORLD_BOUNDS.minY,
      WORLD_BOUNDS.maxX,
      WORLD_BOUNDS.maxY
    ),
    "black"
  );

  for (const obstacle of world.bodies) {
    // render.fillRect(obstacle, `rgb(255, 0, 0)`);
    render.fillCircle(
      obstacle.position.x,
      obstacle.position.y,
      obstacle.radius,
      `rgba(255, 0, 0, 0.5)`
    );
  }
  stats.end();

  requestAnimationFrame(update);
}

update();
