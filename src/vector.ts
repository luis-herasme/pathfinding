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

    return this;
  }

  sub(vector: Vector2) {
    this.x -= vector.x;
    this.y -= vector.y;

    return this;
  }

  multiplyByScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;

    return this;
  }

  divideByScalar(scalar: number) {
    this.x /= scalar;
    this.y /= scalar;

    return this;
  }

  distanceTo(vector: Vector2) {
    return Math.sqrt(
      Math.pow(this.x - vector.x, 2) + Math.pow(this.y - vector.y, 2)
    );
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  normalize() {
    const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);

    if (magnitude > 0) {
      this.x /= magnitude;
      this.y /= magnitude;
    }

    return this;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  static triangleArea2(a: Vector2, b: Vector2, c: Vector2) {
    return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
  }

  cross(vector: Vector2) {
    return this.x * vector.y - this.y * vector.x;
  }

  equals(vector: Vector2) {
    return this.x === vector.x && this.y === vector.y;
  }

  static equals(vector1: Vector2, vector2: Vector2) {
    return vector1.x === vector2.x && vector1.y === vector2.y;
  }

  static add(vector1: Vector2, vector2: Vector2) {
    return new Vector2(vector1.x + vector2.x, vector1.y + vector2.y);
  }

  static divideByScalar(vector: Vector2, scalar: number) {
    return new Vector2(vector.x / scalar, vector.y / scalar);
  }

  static sub(vector1: Vector2, vector2: Vector2) {
    return new Vector2(vector1.x - vector2.x, vector1.y - vector2.y);
  }

  static cross(vector1: Vector2, vector2: Vector2) {
    return vector1.x * vector2.y - vector1.y * vector2.x;
  }

  static multiplyByScalar(vector: Vector2, scalar: number) {
    return new Vector2(vector.x * scalar, vector.y * scalar);
  }

  static random(scale: number): Vector2 {
    return new Vector2(
      (Math.random() - 0.5) * scale,
      (Math.random() - 0.5) * scale
    );
  }
}
