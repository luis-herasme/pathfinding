export type Node<NodeID, NodePosition> = {
  // visited: boolean;
  //
  position: NodePosition;
  neighbors: {
    nodeId: NodeID;
    weight: number;
  }[];
};

export interface PathfindingGraph<NodeID, NodePosition> {
  get(nodeId: NodeID): Node<NodeID, NodePosition> | null;
  set(nodeId: NodeID, node: Node<NodeID, NodePosition>): void;
}
