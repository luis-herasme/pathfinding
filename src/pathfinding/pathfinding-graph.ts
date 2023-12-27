export type Connection<NodeID, NodePosition> = {
  nodeId: NodeID;
  weight: number;
  edge: {
    a: NodePosition;
    b: NodePosition;
  };
};

export type PathfindingGraph<NodeID, NodePosition> = Map<
  NodeID,
  {
    position: NodePosition;
    connections: Connection<NodeID, NodePosition>[];
  }
>;
