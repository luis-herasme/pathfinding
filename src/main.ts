import { World } from "./bodies/world";
import { Box2D } from "./box";
import { planeGraphBuilder } from "./graph-builder";
import { aStar } from "./pathfinding/a-star";
import { QuadPathfinder } from "./quad-pathfinder";
import Render from "./render/render";
import { Scene } from "./scene";
import { Vector2 } from "./vector";

const render = new Render();

const worldBounds = {
  minX: 0,
  minY: 0,
  maxX: 1024,
  maxY: 1024,
};

const world = World.createRandomWorld({
  worldBounds: worldBounds,
  numberOfBodies: 10,
  size: 100,
  velocity: 0.1,
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

  const { path, leaves } = result;

  // Draw quadtree
  // for (const cell of leaves) {
  //   if (cell.occupied) {
  //     render.fillRect(cell.bbox, `rgb(0, 255, 0)`);
  //   } else {
  //     render.strokeRect(cell.bbox, "white");
  //     render.fillCircle(cell.center.x, cell.center.y, 1, "red");
  //   }
  // }

  // Draw path
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    render.drawLine(start.x, start.y, end.x, end.y, "blue", 2);
    render.fillCircle(start.x, start.y, 5, "blue");
  }

  // Draw visited
  // for (const cell of visited) {
  //   render.fillCircle(cell.position.x, cell.position.y, 6, "green");
  // }
};

// const graph = planeGraphBuilder(1024, 1);
// scene.onUpdate = () => {
//   const invalidNodes = new Set<string>();
 
//   // @ts-ignore
//   for (const [nodeId, node] of graph) {
//     for (const body of world.bodies) {
//       if (
//         body.collideWithBox({
//           x: node.position.x - 5,
//           y: node.position.y - 5,
//           width: 10,
//           height: 10,
//         })
//       ) {
//         invalidNodes.add(nodeId);
//         break;
//       }
//     }
//   }

//   // console.log("graph: ", graph)

//   const pathIds = aStar<string, Vector2>({
//     start: "0,0",
//     end: "1000,1000",
//     graph,
//     heuristic: (start, end) => start.distanceTo(end) ** 2,
//     invalidNodes,
//   });

//   if (!pathIds) {
//     return;
//   }

//   const path = pathIds.map((id) => graph.get(id)!.position);

//   // Draw path
//   for (let i = 0; i < path.length - 1; i++) {
//     const start = path[i];
//     const end = path[i + 1];
//     render.drawLine(start.x, start.y, end.x, end.y, "blue", 2);
//     render.fillCircle(start.x, start.y, 5, "blue");
//   }
// };

scene.start();
