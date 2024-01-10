import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

export class PathLineVisualizer {
  // Line
  private line: THREE.Line;
  private lineMaterial: THREE.LineBasicMaterial;

  // Points
  private points: THREE.Mesh;
  private pointsMaterial: THREE.MeshBasicMaterial;
  private pointSize = 5;

  // Scene
  public scene = new THREE.Group();

  constructor({
    lineMaterial,
    pointsMaterial,
  }: {
    lineMaterial: THREE.LineBasicMaterial;
    pointsMaterial: THREE.MeshBasicMaterial;
  }) {
    this.lineMaterial = lineMaterial;
    this.pointsMaterial = pointsMaterial;

    this.line = new THREE.Line();
    this.line.material = this.lineMaterial;

    this.points = new THREE.Mesh();
    this.points.material = this.pointsMaterial;

    this.scene.add(this.line);
    this.scene.add(this.points);
  }

  update(path: THREE.Vector2[]) {
    this.updatePathLine(path);
    this.updatePathPoints(path);
  }

  private updatePathLine(path: THREE.Vector2[]) {
    const pathPoints = [];

    for (let i = 0; i < path.length; i++) {
      pathPoints.push(new THREE.Vector3(path[i].x, 0, path[i].y));
    }

    this.line.geometry.dispose();
    this.line.geometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  }

  private updatePathPoints(path: THREE.Vector2[]) {
    const geometries = [];

    for (let i = 0; i < path.length; i++) {
      const BOX_INDICATOR = new THREE.BoxGeometry(
        this.pointSize,
        this.pointSize,
        this.pointSize
      );

      geometries.push(BOX_INDICATOR.translate(path[i].x, 0, path[i].y));
    }

    this.points.geometry.dispose();
    this.points.geometry = BufferGeometryUtils.mergeGeometries(geometries);
  }
}
