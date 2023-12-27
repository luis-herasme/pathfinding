import { Box2D } from "../box";
import { Triangle } from "../navmesh/triangle";
import { Polygon } from "../polygon";
import { getTexture } from "./get-texture";
import * as THREE from "three";

export function createLine(points: number[][], color = 0xff0000) {
  const material = new THREE.LineBasicMaterial({
    color,
  });

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points.flat(), 3)
  );

  return new THREE.Line(geometry, material);
}

export function createMesh(points: number[][], color = 0xff0000) {
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
  });

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points.flat(), 3)
  );

  const center = new THREE.Vector3();
  for (const point of points) {
    center.add(new THREE.Vector3(point[0], point[1], point[2]));
  }
  center.divideScalar(points.length);

  material.color.setRGB(
    Math.abs(center.y) / 100,
    Math.abs(center.x) / 100,
    Math.abs(center.z) / 100
  );

  return new THREE.Mesh(geometry, material);
}

const circle = await getTexture("circle.png");
export function createNodeIndicator({ x, y }: { x: number; y: number }) {
  const material = new THREE.SpriteMaterial({
    map: circle,
    color: 0xffffff,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.25, 0.25, 0.25);
  sprite.position.set(x, 1, y);
  return sprite;
}

export function createBoxIndicator(box: Box2D) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(box.width, 2, box.height),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );

  mesh.position.set(box.x + box.width / 2, 1, box.y + box.height / 2);
  return mesh;
}

export function drawPolygon(polygon: Polygon): THREE.Group {
  const group = new THREE.Group();
  const vertices = polygon.vertices.map((vertex) => [vertex[0], 1, vertex[1]]);
  const line = createLine(vertices);
  group.add(line);

  for (const vertex of vertices) {
    const sprite = createNodeIndicator({ x: vertex[0], y: vertex[2] });
    group.add(sprite);
    sprite.material.color.setHex(0xff0000);
  }

  return group;
}

export function createTriangleMesh(data: Triangle) {
  const geometry = new THREE.BufferGeometry();

  const vertices = new Float32Array([
    data.a.x,
    data.a.y,
    data.a.z,
    data.b.x,
    data.b.y,
    data.b.z,
    data.c.x,
    data.c.y,
    data.c.z,
  ]);

  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  const color = new THREE.Color();
  color.setRGB(0, Math.abs(data.center.x) / 100, Math.abs(data.center.z) / 100);

  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material);
}

export function drawBBOX(box: Box2D) {
  return createMesh(
    [
      // First triangle
      [box.x, 1, box.y],
      [box.x + box.width, 1, box.y],
      [box.x + box.width, 1, box.y + box.height],
      // Second triangle
      [box.x, 1, box.y],
      [box.x + box.width, 1, box.y + box.height],
      [box.x, 1, box.y + box.height],
    ],
    0x00ff00
  );
}
