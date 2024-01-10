import * as THREE from "three";
import { GREEN_LINE_MATERIAL, PATH_REGION_MATERIAL } from "../materials";

export class PortalsVisualizer {
  public scene = new THREE.Group();
  private portalsMesh: THREE.Line;
  private pathRegion: THREE.Mesh;

  constructor() {
    this.portalsMesh = new THREE.Line();
    this.portalsMesh.material = GREEN_LINE_MATERIAL;
    this.portalsMesh.position.y = 1;

    this.pathRegion = new THREE.Mesh();
    this.pathRegion.material = PATH_REGION_MATERIAL;

    this.scene.add(this.portalsMesh);
    this.scene.add(this.pathRegion);
  }

  update(portals: { left: THREE.Vector2; right: THREE.Vector2 }[]) {
    this.updatePortalsMesh(portals);
    this.updatePathRegion(portals);
  }

  private updatePortalsMesh(
    portals: { left: THREE.Vector2; right: THREE.Vector2 }[]
  ) {
    const linePoints: THREE.Vector3[] = [];

    for (let i = 0; i < portals.length - 1; i++) {
      const startRight = portals[i].right;
      const endRight = portals[i + 1].right;

      const startLeft = portals[i].left;
      const endLeft = portals[i + 1].left;

      linePoints.push(
        new THREE.Vector3(startLeft.x, 0, startLeft.y),
        new THREE.Vector3(startRight.x, 0, startRight.y),
        new THREE.Vector3(endRight.x, 0, endRight.y),
        new THREE.Vector3(endLeft.x, 0, endLeft.y),
        new THREE.Vector3(startLeft.x, 0, startLeft.y)
      );
    }

    this.portalsMesh.geometry.dispose();
    this.portalsMesh.geometry = new THREE.BufferGeometry().setFromPoints(
      linePoints
    );
  }

  private updatePathRegion(
    portals: { left: THREE.Vector2; right: THREE.Vector2 }[]
  ) {
    const pathRegionGeometries = [];

    for (let i = 0; i < portals.length - 1; i++) {
      const startRight = portals[i].right;
      const endRight = portals[i + 1].right;
      const startLeft = portals[i].left;
      const endLeft = portals[i + 1].left;

      pathRegionGeometries.push([
        // Front triangle
        startRight.x,
        0,
        startRight.y,

        endRight.x,
        0,
        endRight.y,

        endLeft.x,
        0,
        endLeft.y,

        // Back triangle
        startLeft.x,
        0,
        startLeft.y,

        endLeft.x,
        0,
        endLeft.y,

        startRight.x,
        0,
        startRight.y,
      ]);
    }

    const pathRegionGeometry = new THREE.BufferGeometry();

    pathRegionGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(pathRegionGeometries.flat(), 3)
    );

    this.pathRegion.geometry.dispose();
    this.pathRegion.geometry = pathRegionGeometry;
  }
}
