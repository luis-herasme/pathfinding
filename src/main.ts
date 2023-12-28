import { World } from "./world";
import Render from "./render/render";
import { triangulate } from "./navmesh/triangle";
import Stats from "stats.js";

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);
const render = new Render();

const WORLD_BOUNDS = {
  minX: 0,
  minY: 0,
  maxX: window.innerWidth,
  maxY: window.innerHeight,
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
  numberOfBodies: 600,
});

function generateWorldMesh() {
  const boxes = world.getBoxes();
  const holeIndices: number[] = [];
  let holeIndicesCount = WORLD_VERTICES.length / 2;

  for (let i = 0; i < boxes.length; i++) {
    holeIndices.push(holeIndicesCount);
    holeIndicesCount = holeIndicesCount + boxes[i].getVertices().length;
  }

  const holes = boxes.map((box) => box.getVertices().flat()).flat();
  const flatData = [...WORLD_VERTICES, ...holes];
  const triangles = triangulate(flatData, holeIndices);
  return triangles;
}

render.init();

function update() {
  stats.begin();
  world.update();
  render.clear();

  const triangles = generateWorldMesh();

  for (const triangle of triangles) {
    const green = Math.round((255 * triangle.center.x) / WORLD_BOUNDS.maxX);
    const blue = Math.round((255 * triangle.center.y) / WORLD_BOUNDS.maxY);
    const color = `rgb(0, ${green}, ${blue})`;
    render.drawTriangle(triangle, color);
  }

  stats.end();
  requestAnimationFrame(update);
}

update();
