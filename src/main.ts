import { World } from "./bodies/world";
import { Box2D } from "./box";
import { getTransformedPoint } from "./camera";
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
  numberOfBodies: 30,
  size: 50,
  velocity: 0.1,
});

const scene = new Scene(render, world);

let mouse = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (e) => {
  mouse = getTransformedPoint(e.offsetX, e.offsetY, render.context);
});

const pathfinder = new QuadPathfinder({
  worldBounds,
  obstacles: world.bodies,
  maxDepth: 6,
});

scene.onUpdate = () => {
  // render.fillCircle(mouse.x, mouse.y, 10, "red");
  world.bodies[0].position = new Vector2(mouse.x, mouse.y);

  const startTime = performance.now();

  const result = pathfinder.findPath({
    start: {
      x: 10,
      y: 10,
    },
    end: {
      x: worldBounds.maxX - 10,
      y: worldBounds.maxY - 10,
    },
  });

  const endTime = performance.now();

  console.log(`QuadPathfinder took ${endTime - startTime}ms`);

  if (!result) {
    return;
  }

  const { path, leaves, portals, smothPath } = result;

  // Draw quadtree
  for (const cell of leaves) {
    if (cell.occupied) {
      render.fillRect(cell.bbox, `rgba(255, 255, 255, 0.5)`);
    } else {
      render.strokeRect(cell.bbox, "rgba(255,255,255,0.1)");
      render.fillCircle(cell.center.x, cell.center.y, 0.5, "red");
    }
  }

  // Draw path
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    render.drawLine(start.x, start.y, end.x, end.y, "blue", 2);
    render.fillCircle(start.x, start.y, 5, "blue");
  }

  // Draw portals
  for (const portal of portals) {
    render.drawLine(
      portal.left.x,
      portal.left.y,
      portal.right.x,
      portal.right.y,
      "rgb(0, 255, 0)",
      1
    );
  }

  // Draw a line conecting the left of the portals
  for (let i = 0; i < portals.length - 1; i++) {
    const start = portals[i].left;
    const end = portals[i + 1].left;
    render.drawLine(start.x, start.y, end.x, end.y, "red", 2);
  }

  // Draw a line conecting the right of the portals
  for (let i = 0; i < portals.length - 1; i++) {
    const start = portals[i].right;
    const end = portals[i + 1].right;
    render.drawLine(start.x, start.y, end.x, end.y, "blue", 2);
  }

  // Fill the polygon resulting from the portals
  for (let i = 0; i < portals.length - 1; i++) {
    const startRight = portals[i].right;
    const endRight = portals[i + 1].right;
    const startLeft = portals[i].left;
    const endLeft = portals[i + 1].left;

    const vertices = [
      startRight.x,
      startRight.y,
      endRight.x,
      endRight.y,
      endLeft.x,
      endLeft.y,
      startLeft.x,
      startLeft.y,
    ];

    Render.drawPolygon(render.context, vertices, "rgba(255, 255, 255, 0.25)");
  }

  // // Draw smoth path
  for (let i = 0; i < smothPath.length - 1; i++) {
    const start = smothPath[i];
    const end = smothPath[i + 1];
    render.drawLine(start.x, start.y, end.x, end.y, "white", 2);
    render.fillCircle(start.x, start.y, 5, "white");
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
//   // for (const [nodeId, node] of graph) {
//   //   for (const body of world.bodies) {
//   //     if (
//   //       body.collideWithBox({
//   //         x: node.position.x - 5,
//   //         y: node.position.y - 5,
//   //         width: 10,
//   //         height: 10,
//   //       })
//   //     ) {
//   //       invalidNodes.add(nodeId);
//   //       break;
//   //     }
//   //   }
//   // }

//   for (const body of world.bodies) {
//     // @ts-ignore
//     const box: Box2D = body.box;
//     const boxX = Math.floor(box.x);
//     const boxY = Math.floor(box.y);
//     const boxWidth = Math.ceil(box.width);
//     const boxHeight = Math.ceil(box.height);

//     for (let x = boxX; x < boxX + boxWidth; x++) {
//       for (let y = boxY; y < boxY + boxHeight; y++) {
//         const nodeId = `${x},${y}`;
//         invalidNodes.add(nodeId);
//       }
//     }
//   }

//   // console.log("graph: ", graph)
//   // console.log("Start: ", graph.get("0,0"))
//   // console.log("End: ", graph.get("1000,1000"))
//   const startTime = performance.now();
//   const pathIds = aStar<string, Vector2>({
//     start: "0,0",
//     end: "1000,1000",
//     graph,
//     heuristic: (start, end) => start.distanceTo(end),
//     invalidNodes,
//   });
//   const endTime = performance.now();

//   console.log(`A* took ${endTime - startTime}ms`);

//   if (!pathIds) {
//     console.log("No path found");
//     return;
//   }

//   // console.log("Path: ", pathIds);

//   const path = pathIds.map((id) => graph.get(id)!.position);

//   // Draw path
//   for (let i = 0; i < path.length - 1; i++) {
//     const start = path[i];
//     const end = path[i + 1];
//     render.drawLine(start.x, start.y, end.x, end.y, "blue", 2);
//     // render.fillCircle(start.x, start.y, 5, "blue");
//   }

//   // // Draw path with a single line
//   // const vertices = path.flatMap((node) => [node.x, node.y]);
//   // Render.drawPolygon(render.context, vertices, "rgba(255, 255, 255, 0.25)");

// };

scene.start();
