import { Triangle } from "./triangle";

class NavMesh {
  private triangles: Triangle[];
  private graph: PathfindingGraph<number, THREE.Vector3>;

  constructor(
    triangles: Triangle[],
    graph: PathfindingGraph<number, THREE.Vector3>
  ) {
    this.triangles = triangles;
    this.graph = graph;
  }

  addConnection(i: number, j: number) {
    const triangleA = this.triangles[i];
    const triangleB = this.triangles[j];

    const nodeDataI = this.graph.get(i);
    const nodeDataJ = this.graph.get(j);

    const weight = triangleA.center.distanceTo(triangleB.center);
    const edge = {
      a: sharedVertices[0],
      b: sharedVertices[1],
    };

    if (nodeDataI) {
      nodeDataI.connections.push({
        nodeId: j,
        weight,
        edge,
      });
    } else {
      this.graph.set(i, {
        position: triangleA.center,
        connections: [
          {
            nodeId: j,
            weight,
            edge,
          },
        ],
      });
    }

    if (nodeDataJ) {
      nodeDataJ.connections.push({
        nodeId: i,
        weight,
        edge,
      });
    } else {
      this.graph.set(j, {
        position: triangleB.center,
        connections: [
          {
            nodeId: i,
            weight,
            edge,
          },
        ],
      });
    }
  }
}