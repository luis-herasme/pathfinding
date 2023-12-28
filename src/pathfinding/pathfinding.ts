import { aStar } from "./a-star";
import { PathfindingGraph } from "./pathfinding-graph";

class Path<NodeID, NodePosition> {
  public end: NodeID;
  public start: NodeID;
  public path: NodeID[] | null;
  public graph: PathfindingGraph<NodeID, NodePosition>;
  public heuristic: (start: NodePosition, end: NodePosition) => number;

  constructor({
    start,
    end,
    path,
    heuristic,
    graph,
  }: {
    start: NodeID;
    end: NodeID;
    path: NodeID[] | null;
    heuristic: (start: NodePosition, end: NodePosition) => number;
    graph: PathfindingGraph<NodeID, NodePosition>;
  }) {
    this.heuristic = heuristic;
    this.start = start;
    this.end = end;
    this.path = path;
    this.graph = graph;
    this.update();
  }

  update() {
    // if (this.isValid(invalidNodes)) {
    //   return;
    // }

    this.path = aStar({
      start: this.start,
      end: this.end,
      graph: this.graph,
      invalidNodes: new Set(),
      heuristic: this.heuristic,
    });
  }

  // private isValid(invalidNodes: Set<NodeID>): boolean {
  //   if (this.path === null) {
  //     return false;
  //   }

  //   if (this.path.length === 0) {
  //     return false;
  //   }

  //   for (let i = 0; i < this.path.length; i++) {
  //     if (invalidNodes.has(this.path[i])) {
  //       return false;
  //     }
  //   }

  //   return true;
  // }
}

export class PathfindingSystem<NodeID, NodePosition> {
  public graph: PathfindingGraph<NodeID, NodePosition>;
  public paths: Map<number, Path<NodeID, NodePosition>> = new Map();

  private running = false;
  private currentPathId = 0;
  private updatePeriod = 100;
  private updateIntervalId: number | null = null;
  private heuristic: (start: NodePosition, end: NodePosition) => number;
  // private checkNode: (position: NodePosition) => boolean;

  constructor({
    graph,
    heuristic,
    updatePeriod,
    // checkNode,
  }: {
    graph: PathfindingGraph<NodeID, NodePosition>;
    heuristic: (start: NodePosition, end: NodePosition) => number;
    updatePeriod: number;
    // checkNode: (position: NodePosition) => boolean;
  }) {
    this.heuristic = heuristic;
    this.updatePeriod = updatePeriod;
    this.graph = graph;
    // this.checkNode = checkNode;
  }

  start() {
    if (this.running) {
      return;
    }

    this.updateIntervalId = setInterval(() => {
      this.update();
    }, this.updatePeriod);

    this.running = true;
  }

  stop() {
    if (!this.running) {
      return;
    }

    if (this.updateIntervalId !== null) {
      clearInterval(this.updateIntervalId);
    }

    this.running = false;
  }

  createPath(start: NodeID, end: NodeID) {
    const id = this.currentPathId++;

    const path = new Path({
      start,
      end,
      path: null,
      heuristic: this.heuristic,
      graph: this.graph,
    });

    this.paths.set(id, path);
    return path;
  }

  removePath(id: number) {
    this.paths.delete(id);
  }

  private update() {
    // this.invalidNodes = this.checkForInvalidNodes();

    for (let path of this.paths.values()) {
      path.update();
    }
  }

  // private checkForInvalidNodes(): Set<NodeID> {
  //   const invalidNodes: Set<NodeID> = new Set();

  //   for (const [node, nodeData] of this.graph) {
  //     const occupied = this.checkNode(nodeData.position);

  //     if (occupied) {
  //       invalidNodes.add(node);
  //     }
  //   }

  //   return invalidNodes;
  // }
}
