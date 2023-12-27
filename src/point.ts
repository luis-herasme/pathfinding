export type Point2D = {
  x: number;
  y: number;
};

export type Point3D = {
  x: number;
  y: number;
  z: number;
};

export function euclideanDistance2D(a: Point2D, b: Point2D): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
