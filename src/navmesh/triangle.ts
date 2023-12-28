import earcut from "earcut";
import { Vector2 } from "../vector";

export type Triangle = {
  i1: number;
  i2: number;
  i3: number;
  a: Vector2;
  b: Vector2;
  c: Vector2;
  center: Vector2;
};

function getTriangles(indices: number[], data: number[]): Triangle[] {
  const triangles: Triangle[] = [];

  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];

    const triangle: Triangle = {
      i1: a,
      i2: b,
      i3: c,
      a: new Vector2(data[a * 2], data[a * 2 + 1]),
      b: new Vector2(data[b * 2], data[b * 2 + 1]),
      c: new Vector2(data[c * 2], data[c * 2 + 1]),
      center: new Vector2(0, 0),
    };

    triangle.center.add(triangle.a);
    triangle.center.add(triangle.b);
    triangle.center.add(triangle.c);
    triangle.center.divideByScalar(3);

    triangles.push(triangle);
  }

  return triangles;
}

export function getSharedVertices(t1: Triangle, t2: Triangle): Vector2[] {
  const result: Vector2[] = [];

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

export function triangulate(flatData: number[], holeIndices: number[]) {
  const triangles = earcut(flatData, holeIndices);
  return getTriangles(triangles, flatData);
}
