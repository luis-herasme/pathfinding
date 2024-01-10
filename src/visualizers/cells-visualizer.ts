import * as THREE from "three";
import { CellDecomposition } from "../cell-decomposition";
import { EMPTY_MATERIAL, OCCUPIED_MATERIAL } from "../materials";

export class CellsVisualizer {
  public scene = new THREE.Group();
  private emptyMeshes: THREE.Mesh;
  private occupiedMeshes: THREE.Mesh;

  constructor() {
    this.emptyMeshes = new THREE.Mesh();
    this.emptyMeshes.material = EMPTY_MATERIAL;

    this.occupiedMeshes = new THREE.Mesh();
    this.occupiedMeshes.material = OCCUPIED_MATERIAL;

    this.scene.add(this.emptyMeshes);
    this.scene.add(this.occupiedMeshes);
  }

  update(cells: CellDecomposition[]) {
    const occupiedGeometries: number[] = [];
    const emptyGeometries: number[] = [];

    for (const cell of cells) {
      if (cell.occupied) {
        occupiedGeometries.push(...cell.bbox.getGeometry());
      } else {
        emptyGeometries.push(...cell.bbox.getGeometry());
      }
    }

    const occupiedGeometry = new THREE.BufferGeometry();

    occupiedGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(occupiedGeometries, 3)
    );

    this.occupiedMeshes.geometry.dispose();
    this.occupiedMeshes.geometry = occupiedGeometry;

    const emptyGeometry = new THREE.BufferGeometry();

    emptyGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(emptyGeometries, 3)
    );

    this.emptyMeshes.geometry.dispose();
    this.emptyMeshes.geometry = emptyGeometry;
  }
}
