import { Box2D } from "../box";
import { Polygon } from "../polygon";
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

export function createMesh(points: number[][], color = 0xff0000): THREE.Mesh {
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
  });

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points.flat(), 3)
  );

  return new THREE.Mesh(geometry, material);
}

export function createBoxIndicator(box: Box2D): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(box.width, 20, box.height);
  geometry.translate(box.width / 2, 10, box.height / 2);

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      // transparent: true,
      // opacity: 0.75
    })
  );

  mesh.position.set(box.x + box.width / 2, 1, box.y + box.height / 2);
  return mesh;
}

export function createCylinderIndicator(radius: number): THREE.Group {
  const group = new THREE.Group();
  const geometry = new THREE.CylinderGeometry(radius, radius, 20);
  geometry.translate(0, 10, 0);
  //   const material = new THREE.MeshBasicMaterial({
  //     color: 0xff0000,
  //     depthWrite: false,
  //     // transparent: true,
  //     // opacity: 0.75
  //   });
  //   const sphere = new THREE.Mesh(geometry, material);
  //   group.add(sphere);
  // sphere.renderOrder = 1;
  const wireframe = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    })
  );
  group.add(wireframe);

  return group;
}

export function drawPolygonOutline(polygon: Polygon): THREE.Group {
  const group = new THREE.Group();
  const vertices = polygon.vertices.map((vertex) => [vertex[0], 1, vertex[1]]);
  const line = createLine(vertices);
  group.add(line);

  // for (const vertex of vertices) {
  //   const sprite = createNodeIndicator({ x: vertex[0], y: vertex[2] });
  //   group.add(sprite);
  //   sprite.material.color.setHex(0xff0000);
  // }

  return group;
}

export function drawBBOX(box: Box2D, color = 0xff0000) {
  return createMesh(
    [
      [box.x, box.y],
      [box.x + box.width, box.y],
      [box.x + box.width, box.y + box.height],
      [box.x, box.y + box.height],
    ],
    color
  );
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
