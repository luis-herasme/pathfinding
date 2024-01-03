import { BinaryHeap } from "./binary-heap";
import { PathfindingGraph } from "./pathfinding-graph";

type aStarOptions<NodeID, NodePosition> = {
  start: NodeID;
  end: NodeID;
  graph: PathfindingGraph<NodeID, NodePosition>;
  heuristic: (start: NodePosition, end: NodePosition) => number;
  invalidNodes: Set<NodeID>;
};

export function aStar<NodeID, NodePosition>({
  start,
  end,
  graph,
  invalidNodes,
  heuristic,
}: aStarOptions<NodeID, NodePosition>): NodeID[] | null {
  if (!graph.get(start) || !graph.get(end)) {
    console.warn(`Start or end node does not exist in graph: ${start}, ${end}`);
    return null;
  }

  if (invalidNodes.has(start)) {
    console.warn(`Start node is invalid: ${start}`);
    return null;
  }

  if (invalidNodes.has(end)) {
    console.warn(`End node is invalid: ${end}`);
    return null;
  }

  const hCache = new Map<NodeID, number>();
  const gScore = new Map<NodeID, number>();
  const fScore = new Map<NodeID, number>();
  const previousNode = new Map<NodeID, NodeID>();

  const openSet = new BinaryHeap<NodeID>();
  const endNodePosition = graph.get(end)!.position;

  gScore.set(start, 0);
  fScore.set(start, heuristic(graph.get(start)!.position, endNodePosition));
  openSet.enqueue(start, fScore.get(start)!);

  while (!openSet.isEmpty()) {
    const currentNodeID = openSet.dequeue()!.value;

    if (currentNodeID === end) {
      break;
    }

    const currentNode = graph.get(currentNodeID)!;

    for (const neighbor of currentNode.neighbors) {
      if (invalidNodes.has(neighbor.nodeId)) {
        continue;
      }

      const tentativeGScore = gScore.get(currentNodeID)! + neighbor.weight;

      if (
        !gScore.has(neighbor.nodeId) ||
        tentativeGScore < gScore.get(neighbor.nodeId)!
      ) {
        previousNode.set(neighbor.nodeId, currentNodeID);
        gScore.set(neighbor.nodeId, tentativeGScore);

        let hValue = hCache.get(neighbor.nodeId);

        if (hValue === undefined) {
          const neighborNode = graph.get(neighbor.nodeId);
          if (!neighborNode) {
            throw new Error(`Neighbor node does not exist: ${neighbor.nodeId}`);
          }
          hValue = heuristic(neighborNode.position, endNodePosition);
          hCache.set(neighbor.nodeId, hValue);
        }

        const f = tentativeGScore + hValue;

        if (!fScore.has(neighbor.nodeId) || f < fScore.get(neighbor.nodeId)!) {
          fScore.set(neighbor.nodeId, f);
          openSet.enqueue(neighbor.nodeId, f);
        }
      }
    }
  }

  const path = [];
  let node: NodeID | undefined = end;

  while (node) {
    path.push(node);
    node = previousNode.get(node);
  }

  return path.reverse();
}
