import { Box2D } from "./box";
import * as THREE from "three";

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

export function createBoxGeometry(box: Box2D, y: number) {
  return [
    // Top left triangle
    box.minX,
    y,
    box.minY,
    box.maxX,
    y,
    box.minY,
    box.minX,
    y,
    box.maxY,

    // Bottom right triangle
    box.maxX,
    y,
    box.minY,
    box.maxX,
    y,
    box.maxY,
    box.minX,
    y,
    box.maxY,
  ] as const;
}

export function createBoxOutlineGeometry(box: Box2D): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(createBoxGeometry(box, 0), 3)
  );

  return geometry;
}
