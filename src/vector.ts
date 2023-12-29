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
