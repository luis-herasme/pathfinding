import earcut from "earcut";
import * as THREE from "three";
import { createLine, createNodeIndicator } from "./render/render";
import { PathfindingGraph } from "./pathfinding/pathfinding-graph";
import { Triangle } from "./navmesh/triangle";

// export function getTrianglesMesh(flatData: number[], holeIndices: number[]) {
//   const result = new THREE.Group();
//   const triangles = earcut(flatData, holeIndices);
//   const trianglesData = convertIndicesToTriangles(triangles, flatData);
//   const triangleMeshes = trianglesData.map(createTriangleMesh);
//   triangleMeshes.forEach((mesh) => result.add(mesh));

//   const graph = getGraph(trianglesData);
//   const connectionsAdded: Set<string> = new Set();

//   for (const nodeID of graph.keys()) {
//     const node = graph.get(nodeID)!;

//     const nodeIndicator = createNodeIndicator({
//       x: node.position.x,
//       y: node.position.z,
//     });

//     nodeIndicator.scale.set(1, 1, 1);

//     result.add(nodeIndicator);

//     for (const connection of node.connections) {
//       if (
//         connectionsAdded.has(`${nodeID}-${connection.nodeId}`) ||
//         connectionsAdded.has(`${connection.nodeId}-${nodeID}`)
//       ) {
//         continue;
//       }

//       const connectedNode = graph.get(connection.nodeId)!;
//       const midpoint = new THREE.Vector3();
//       midpoint.add(connection.edge.a);
//       midpoint.add(connection.edge.b);
//       midpoint.divideScalar(2);

//       const line = createLine([
//         [node.position.x, 1, node.position.z],
//         [midpoint.x, 1 + Math.random(), midpoint.z],
//         [connectedNode.position.x, 1, connectedNode.position.z],
//       ]);

//       result.add(line);
//       connectionsAdded.add(`${nodeID}-${connection.nodeId}`);
//       connectionsAdded.add(`${connection.nodeId}-${nodeID}`);
//     }

//     // const midpoint = new THREE.Vector3();
//     // midpoint.add(graph.edge.a);
//     // midpoint.add(graph.edge.b);
//     // midpoint.divideScalar(2);

//     // const line = createLine([
//     //   [
//     //     trianglesData[graph.conection[0]].center.x,
//     //     1,
//     //     trianglesData[graph.conection[0]].center.z,
//     //   ],
//     //   [midpoint.x, 1, midpoint.z],
//     //   [
//     //     trianglesData[graph.conection[1]].center.x,
//     //     1,
//     //     trianglesData[graph.conection[1]].center.z,
//     //   ],
//     // ]);

//     // result.add(line);
//   }

//   return {
//     graph,
//     result,
//   };
// }

// function getGraph(
//   trianglesData: Triangle[]
// ): PathfindingGraph<number, THREE.Vector3> {
//   // If two triangles share two vertices, they are connected
//   // This function returns an array of indices of connected triangles
//   const result: PathfindingGraph<number, THREE.Vector3> = new Map();

//   for (let i = 0; i < trianglesData.length; i++) {
//     const triangleA = trianglesData[i];
//     let numberOfConnections = 0;

//     for (let j = i + 1; j < trianglesData.length; j++) {
//       const triangleB = trianglesData[j];
//       const sharedVertices = getSharedVertices(triangleA, triangleB);

//       if (sharedVertices.length === 2) {
//         numberOfConnections += 1;
//         const nodeDataI = result.get(i);
//         const nodeDataJ = result.get(j);
//         const weight = triangleA.center.distanceTo(triangleB.center);

//         const edge = {
//           a: sharedVertices[0],
//           b: sharedVertices[1],
//         };
//       }

//       if (numberOfConnections === 3) {
//         break;
//       }
//     }
//   }

//   return result;
// }
