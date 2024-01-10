import * as THREE from "three";
import { CELLS_IN_PATH_MATERIAL } from "../materials";
import { NavQuadtree } from "../pathfinding/nav-quadtree";

export class PathCellsVisualizer {
  public scene = new THREE.Mesh();

  constructor() {
    this.scene.material = CELLS_IN_PATH_MATERIAL;
  }

  update(cells: NavQuadtree[]) {
    const cellsInPathGeometries: number[] = [];
    const cellsInPathGeometry = new THREE.BufferGeometry();

    for (const cell of cells) {
      cellsInPathGeometries.push(...cell.bbox.getGeometry());
    }

    cellsInPathGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(cellsInPathGeometries, 3)
    );

    this.scene.geometry.dispose();
    this.scene.geometry = cellsInPathGeometry;
  }
}
