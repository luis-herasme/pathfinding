export class Vector2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(vector: Vector2) {
    this.x += vector.x;
    this.y += vector.y;
  }

  sub(vector: Vector2) {
    this.x -= vector.x;
    this.y -= vector.y;
  }

  multiplyByScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
  }

  divideByScalar(scalar: number) {
    this.x /= scalar;
    this.y /= scalar;
  }

  distanceTo(vector: Vector2) {
    return Math.sqrt(
      Math.pow(this.x - vector.x, 2) + Math.pow(this.y - vector.y, 2)
    );
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  static random(scale: number): Vector2 {
    return new Vector2(
      (Math.random() - 0.5) * scale,
      (Math.random() - 0.5) * scale
    );
  }
}
