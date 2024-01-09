import { PathfindingGraph } from "./pathfinding/pathfinding-graph";
import { Vector2 } from "three";

export function planeGraphBuilder(
  gridSize: number,
  spacing: number
): PathfindingGraph<string, Vector2> {
  const graph: PathfindingGraph<string, Vector2> = new Map();

  for (let x = 0; x <= gridSize * spacing; x += spacing) {
    for (let y = 0; y <= gridSize * spacing; y += spacing) {
      const neighbors: {
        nodeId: string;
        weight: number;
      }[] = [];

      if (x > 0) {
        neighbors.push({
          nodeId: `${x - spacing},${y}`,
          weight: 1 * spacing,
        });
      }

      if (x < gridSize * spacing) {
        neighbors.push({
          nodeId: `${x + spacing},${y}`,
          weight: 1 * spacing,
        });
      }

      if (y > 0) {
        neighbors.push({
          nodeId: `${x},${y - spacing}`,
          weight: 1 * spacing,
        });
      }

      if (y < gridSize * spacing) {
        neighbors.push({
          nodeId: `${x},${y + spacing}`,
          weight: 1 * spacing,
        });
      }

      // Diagonals
      if (x > 0 && y > 0) {
        neighbors.push({
          nodeId: `${x - spacing},${y - spacing}`,
          weight: Math.SQRT2 * spacing,
        });
      }

      if (x < gridSize * spacing && y < gridSize * spacing) {
        neighbors.push({
          nodeId: `${x + spacing},${y + spacing}`,
          weight: Math.SQRT2 * spacing,
        });
      }

      if (x > 0 && y < gridSize * spacing) {
        neighbors.push({
          nodeId: `${x - spacing},${y + spacing}`,
          weight: Math.SQRT2 * spacing,
        });
      }

      if (x < gridSize * spacing && y > 0) {
        neighbors.push({
          nodeId: `${x + spacing},${y - spacing}`,
          weight: Math.SQRT2 * spacing,
        });
      }

      graph.set(`${x},${y}`, {
        position: new Vector2(x, y),
        neighbors,
      });
    }
  }

  return graph;
}
