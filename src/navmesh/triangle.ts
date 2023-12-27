import * as THREE from "three";

export type Triangle = {
  i1: number;
  i2: number;
  i3: number;
  a: THREE.Vector3;
  b: THREE.Vector3;
  c: THREE.Vector3;
  center: THREE.Vector3;
};

export function getTriangles(indices: number[], data: number[]): Triangle[] {
  const triangles: Triangle[] = [];

  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];

    const triangle: Triangle = {
      i1: a,
      i2: b,
      i3: c,
      a: new THREE.Vector3(data[a * 2], 0.5, data[a * 2 + 1]),
      b: new THREE.Vector3(data[b * 2], 0.5, data[b * 2 + 1]),
      c: new THREE.Vector3(data[c * 2], 0.5, data[c * 2 + 1]),
      center: new THREE.Vector3(),
    };

    triangle.center.add(triangle.a);
    triangle.center.add(triangle.b);
    triangle.center.add(triangle.c);
    triangle.center.divideScalar(3);

    triangles.push(triangle);
  }

  return triangles;
}

export function getSharedVertices(t1: Triangle, t2: Triangle): THREE.Vector3[] {
  const result: THREE.Vector3[] = [];

  if (t1.i1 === t2.i1 || t1.i1 === t2.i2 || t1.i1 === t2.i3) {
    result.push(t1.a);
  }

  if (t1.i2 === t2.i1 || t1.i2 === t2.i2 || t1.i2 === t2.i3) {
    result.push(t1.b);
  }

  if (t1.i3 === t2.i1 || t1.i3 === t2.i2 || t1.i3 === t2.i3) {
    result.push(t1.c);
  }

  return result;
}
