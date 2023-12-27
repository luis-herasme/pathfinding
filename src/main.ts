import { Box2D } from "./box";
import { setupScene } from "./setup";
import { NavGridRect } from "./mesh-generator";
import { createBoxIndicator, drawBBOX } from "./render/render";
import * as THREE from "three";
import { Body } from "./body";
const { scene } = setupScene();

const boxes: Box2D[] = [];
const bodies: Body[] = [];
// boxes.push(new Box2D(25, 25, 50, 50));
// boxes.push(new Box2D(5, 5, 10, 10));
for (let i = 0; i < 10; i++) {
  boxes.push(new Box2D(Math.random() * 100, Math.random() * 100, 10, 10));
}

for (const box of boxes) {
  const body = new Body({
    velocity: new THREE.Vector2(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1
    ),
    box,
    worldBounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
  });

  bodies.push(body);
  scene.add(body.indicator);
}

let lastFrameGroup = new THREE.Group();

function update() {
  scene.remove(lastFrameGroup);
  lastFrameGroup = new THREE.Group();

  for (const body of bodies) {
    body.update();
  }

  const navGridRect = new NavGridRect(new Box2D(0, 0, 100, 100));
  navGridRect.subdivide(boxes);
  const bboxes = navGridRect.getAllBoxes();
  console.log("bboxes: ", bboxes.length)
  for (const box of bboxes) {
    lastFrameGroup.add(drawBBOX(box));
  }

  scene.add(lastFrameGroup);
}

setInterval(update, 1000 / 60);

// const WORLD_BOUNDS = {
//   minX: 0,
//   minY: 0,
//   maxX: 100,
//   maxY: 100,
// };

// const worldVertices = [
//   WORLD_BOUNDS.minX,
//   WORLD_BOUNDS.minY,
//   WORLD_BOUNDS.maxX,
//   WORLD_BOUNDS.minY,
//   WORLD_BOUNDS.maxX,
//   WORLD_BOUNDS.maxY,
//   WORLD_BOUNDS.minX,
//   WORLD_BOUNDS.maxY,
// ];

// const boxIndicator = createLine(
//   [
//     [boxes[0].x, 1, boxes[0].y],
//     [boxes[0].x + boxes[0].width, 1, boxes[0].y],
//     [boxes[0].x + boxes[0].width, 1, boxes[0].y + boxes[0].height],
//     [boxes[0].x, 1, boxes[0].y + boxes[0].height],
//     [boxes[0].x, 1, boxes[0].y],
//   ],
//   0x00ff00
// );

// scene.add(boxIndicator);

// for (let i = 0; i < 1; i++) {
//   const box = Polygon.createBox(
//     Math.random() * 80,
//     Math.random() * 80,
//     Math.random() * 10 + 10,
//     Math.random() * 10 + 10
//   );

//   boxes.push(box);
// }

// const SPEED = 0.01;

// const bodies = boxes.map(
//   (box) =>
//     new Body({
//       polygon: box,
//       velocity: new Vector2(Math.random() * SPEED, Math.random() * SPEED),
//       worldBounds: WORLD_BOUNDS,
//     })
// );

// !
// const holeIndices: number[] = [];
// const mergedBoxes = Polygon.merge(boxes);
// let holeIndicesCount = worldVertices.length / 2;

// for (let i = 0; i < mergedBoxes.length; i++) {
//   scene.add(drawPolygon(mergedBoxes[i]));
//   holeIndices.push(holeIndicesCount);
//   holeIndicesCount = holeIndicesCount + mergedBoxes[i].vertices.length;
// }

// const holes = mergedBoxes.map((box) => box.vertices.flat()).flat();
// const flatData = [...worldVertices, ...holes];
// const { graph, result } = getTriangles(flatData, holeIndices);

// scene.add(result);
//
// const pathfindingSystem = new PathfindingSystem<number, THREE.Vector3>({
//   updatePeriod: 1000,
//   graph: graph,
//   heuristic: (start, end) => start.distanceTo(end),
//   // checkNode: world.pointIsOccupied,
// });

// const pathStart = 0;
// const pathEnd = 6;

// // Draw path start and end
// const start = graph.get(pathStart);
// const end = graph.get(pathEnd);

// if (!start || !end) {
//   throw new Error("Start or end not found");
// }

// const startIndicator = createNodeIndicator({
//   x: start.position.x,
//   y: start.position.z,
// });

// const endIndicator = createNodeIndicator({
//   x: end.position.x,
//   y: end.position.z,
// });

// startIndicator.material.color.setHex(0xff0000);
// endIndicator.material.color.setHex(0xff0000);
// startIndicator.scale.set(3, 3, 3);
// endIndicator.scale.set(3, 3, 3);

// scene.add(startIndicator);
// scene.add(endIndicator);

// const path = pathfindingSystem.createPath(pathStart, pathEnd);
// console.log("path: ", path);
// const pathLine = drawPath(graph, [pathStart, ...path.path!]);
// scene.add(pathLine);

// function drawPath(
//   graph: PathfindingGraph<number, THREE.Vector3>,
//   path: number[]
// ) {
//   const pathGroup = new Group();
//   console.log("Drawing path: ", path);
//   for (let i = 0; i < path.length - 1; i++) {
//     const a = graph.get(path[i])!.position;
//     const b = graph.get(path[i + 1])!.position;
//     console.log("a: ", a);
//     console.log("b: ", b);

//     const line = createLine(
//       [
//         [a.x, 2, a.z],
//         [b.x, 2, b.z],
//       ],
//       0xffffff
//     );
//     console.log("line: ", line);

//     pathGroup.add(line);
//   }

//   return pathGroup;
// }

// let sceneGroup = new Group();

// function update() {
//   scene.remove(sceneGroup);
//   sceneGroup = new Group();

//   // bodies.forEach((body) => body.update());

//   const holeIndices: number[] = [];
//   const mergedBoxes = Polygon.merge(boxes);
//   let holeIndicesCount = worldVertices.length / 2;

//   for (let i = 0; i < mergedBoxes.length; i++) {
//     sceneGroup.add(drawPolygon(mergedBoxes[i]));
//     holeIndices.push(holeIndicesCount);
//     holeIndicesCount = holeIndicesCount + mergedBoxes[i].vertices.length;
//   }

//   const holes = mergedBoxes.map((box) => box.vertices.flat()).flat();
//   const flatData = [...worldVertices, ...holes];
//   const { graph, result } = getTriangles(flatData, holeIndices);
//   sceneGroup.add(result);

//   scene.add(sceneGroup);
// }

// setInterval(update, 1000 / 10);

// const ground = new Mesh(
//   new BoxGeometry(
//     WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX,
//     0,
//     WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY
//   ),
//   new MeshBasicMaterial({ color: 0xffffff, side: BackSide })
// );

// ground.position.set(
//   (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX) / 2,
//   0,
//   (WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY) / 2
// );

// scene.add(ground);

// world.pointIsOccupied({ x: 10, y: 10 });

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

//

// const p1 = Polygon.fromBox(new Box2D(-5, -5, 10, 10));
// p1.setTranslation(15, 15);

// const p2 = new Polygon([
//   [0, -5],
//   [5, 5],
//   [-5, 5],
//   [0, -5],
// ]);
// p2.setTranslation(10, 10);

// // Cast a ray from the mouse to the ground to know the position
// // of the mouse on the ground
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();
// document.addEventListener("mousemove", (event) => {
//   mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//   raycaster.setFromCamera(mouse, camera);

//   const intersects = raycaster.intersectObject(ground);

//   if (intersects.length > 0) {
//     const { x, z } = intersects[0].point;
//     const roundedX = x; //roundToNearest(x, 5);
//     const roundedZ = z; //roundToNearest(z, 5);
//     p1.setTranslation(roundedX, roundedZ);
//   }
// });

// const world = World.createRandomWorld({
//   numberOfBoxes: 3,
//   worldSize: 100,
// });
