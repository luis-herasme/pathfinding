import { Box2D } from "./box";
import { triangulate } from "./navmesh/triangle";
import Render from "./render/render";

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

const boxes: Box2D[] = [];

for (let i = 0; i < 3; i++) {
  const x = Math.random() * 1000 - 50;
  const y = Math.random() * 1000 - 50;

  boxes.push(new Box2D(x, y, 50, 50));
}

const holeIndices: number[] = [];
let holeIndicesCount = WORLD_VERTICES.length / 2;

for (let i = 0; i < boxes.length; i++) {
  holeIndices.push(holeIndicesCount);
  holeIndicesCount = holeIndicesCount + boxes[i].getVertices().length;
}

const holes = boxes.map((box) => box.getVertices().flat()).flat();
const flatData = [...WORLD_VERTICES, ...holes];
const triangles = triangulate(flatData, holeIndices);

for (const triangle of triangles) {
  render.add({
    render(context) {
      context.beginPath();

      const green = Math.round((255 * triangle.center.x) / 1000);
      const blue = Math.round((255 * triangle.center.y) / 1000);

      context.fillStyle = `rgb(0, ${green}, ${blue})`;
      context.strokeStyle = "#000000";

      context.moveTo(triangle.a.x, triangle.a.y);
      context.lineTo(triangle.b.x, triangle.b.y);
      context.lineTo(triangle.c.x, triangle.c.y);
      context.lineTo(triangle.a.x, triangle.a.y);

      context.fill();
      context.stroke();
    },
  });
}

render.start();
