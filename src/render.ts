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

  mesh.position.set(box.x + box.width / 2, 1, box.y + box.height / 2);
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
    box.x,
    y,
    box.y,
    box.x + box.width,
    y,
    box.y,
    box.x,
    y,
    box.y + box.height,

    // Bottom right triangle
    box.x + box.width,
    y,
    box.y,
    box.x + box.width,
    y,
    box.y + box.height,
    box.x,
    y,
    box.y + box.height,
  ] as const;
}

export function createBoxOutlineGeometry(box: Box2D): THREE.BufferGeometry {
  const points = [
    [box.x, 0, box.y],
    [box.x + box.width, 0, box.y],
    [box.x + box.width, 0, box.y + box.height],
    [box.x, 0, box.y + box.height],
    [box.x, 0, box.y],
  ];

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points.flat(), 3)
  );

  return geometry;
}
