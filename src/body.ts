import { Box2D } from "./box";
import { Vector2 } from "./vector";

export class Body {
  box: Box2D;
  velocity: Vector2;
  position: Vector2;

  constructor({ velocity, box }: { velocity: Vector2; box: Box2D }) {
    this.velocity = velocity;
    this.box = box;
    this.position = new Vector2(box.x, box.y);
  }

  update() {
    this.position.add(this.velocity);

    this.box.x = this.position.x;
    this.box.y = this.position.y;
  }

  collide(other: Body) {
    const centerX = this.position.x + this.box.width / 2;
    const centerY = this.position.y + this.box.height / 2;

    const otherCenterX = other.position.x + other.box.width / 2;
    const otherCenterY = other.position.y + other.box.height / 2;

    const dx = centerX - otherCenterX;
    const dy = centerY - otherCenterY;

    const halfTotalWidth = (this.box.width + other.box.width) / 2;
    const halfTotalHeight = (this.box.height + other.box.height) / 2;

    const crossWidth = halfTotalWidth * dy;
    const crossHeight = halfTotalHeight * dx;

    if (Math.abs(dx) <= halfTotalWidth && Math.abs(dy) <= halfTotalHeight) {
      if (crossWidth > crossHeight) {
        if (crossWidth > -crossHeight) {
          this.velocity.y *= -1;
          other.velocity.y *= -1;
          this.position.y += halfTotalHeight - dy;
        } else {
          this.velocity.x *= -1;
          other.velocity.x *= -1;
          this.position.x -= dx + halfTotalWidth;
        }
      } else {
        if (crossWidth > -crossHeight) {
          this.velocity.x *= -1;
          other.velocity.x *= -1;
          this.position.x += halfTotalWidth - dx;
        } else {
          this.velocity.y *= -1;
          other.velocity.y *= -1;
          this.position.y -= dy + halfTotalHeight;
        }
      }
    }
  }
}
