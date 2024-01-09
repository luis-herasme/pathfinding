import { Box2D } from "./box";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

export function createBoxIndicator(box: Box2D): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(box.width, 20, box.height);
  geometry.translate(box.width / 2, 10, box.height / 2);

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    })
  );

  mesh.position.set(box.minX + box.width / 2, 1, box.minY + box.height / 2);
  return mesh;
}

export function createCylinderIndicator(radius: number): THREE.Mesh {
  const geometry = new THREE.CylinderGeometry(radius, radius, 20);
  geometry.translate(0, 10, 0);

  const wireframe = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    })
  );

  return wireframe;
}

export function createBoxOutlineGeometry(box: Box2D): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(box.getGeometry(), 3)
  );

  return geometry;
}

export function drawPathLine(
  path: THREE.Vector2[],
  material: THREE.LineBasicMaterial
): THREE.Line {
  const y = 10;
  const pathPoints = [];

  for (let i = 0; i < path.length; i++) {
    pathPoints.push(new THREE.Vector3(path[i].x, y, path[i].y));
  }

  const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  return new THREE.Line(pathGeometry, material);
}

export function drawPathPoints(
  path: THREE.Vector2[],
  material: THREE.Material
): THREE.Mesh {
  const geometries = [];
  const y = 10;
  const SIZE = 5;

  for (let i = 0; i < path.length; i++) {
    const BOX_INDICATOR = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
    geometries.push(BOX_INDICATOR.translate(path[i].x, y, path[i].y));
  }

  const geometry = BufferGeometryUtils.mergeGeometries(geometries);
  return new THREE.Mesh(geometry, material);
}
