import { Box2D } from "./box";

export class NavGridRect {
  private bbox: Box2D;
  private childs: NavGridRect[] = [];

  constructor(bbox: Box2D) {
    this.bbox = bbox;
  }

  getAllBoxes(): Box2D[] {
    let boxes: Box2D[] = [this.bbox];

    for (const child of this.childs) {
      boxes = [...boxes, ...child.getAllBoxes()];
    }

    return boxes;
  }

  subdivide(obstacles: Box2D[]) {
    for (const obstacle of obstacles) {
      if (
        this.bbox.collidesWith(obstacle) &&
        obstacle.x > this.bbox.x &&
        obstacle.x < this.bbox.x + this.bbox.width
      ) {
        const right = new NavGridRect(
          new Box2D(
            obstacle.x,
            this.bbox.y,
            this.bbox.x + this.bbox.width - obstacle.x,
            this.bbox.height
          )
        );

        this.bbox.width = this.bbox.width - right.bbox.width;
        right.subdivide(obstacles);
        this.childs.push(right);
      }


      if (
        this.bbox.collidesWith(obstacle) &&
        obstacle.y > this.bbox.y &&
        obstacle.y < this.bbox.y + this.bbox.height
      ) {
        const bottom = new NavGridRect(
          new Box2D(
            this.bbox.x,
            obstacle.y,
            this.bbox.width,
            this.bbox.y + this.bbox.height - obstacle.y
          )
        );

        this.bbox.height = this.bbox.height - bottom.bbox.height;
        bottom.subdivide(obstacles);
        this.childs.push(bottom);
      }


      if (
        this.bbox.collidesWith(obstacle) &&
        obstacle.x + obstacle.width > this.bbox.x &&
        obstacle.x + obstacle.width < this.bbox.x + this.bbox.width
      ) {
        const left = new NavGridRect(
          new Box2D(
            this.bbox.x,
            this.bbox.y,
            obstacle.x + obstacle.width - this.bbox.x,
            this.bbox.height
          )
        );

        this.bbox.x = obstacle.x + obstacle.width;
        this.bbox.width = this.bbox.width - left.bbox.width;
        left.subdivide(obstacles);
        this.childs.push(left);
      }

      if (
        this.bbox.collidesWith(obstacle) &&
        obstacle.y + obstacle.height > this.bbox.y &&
        obstacle.y + obstacle.height < this.bbox.y + this.bbox.height
      ) {
        const top = new NavGridRect(
          new Box2D(
            this.bbox.x,
            this.bbox.y,
            this.bbox.width,
            obstacle.y + obstacle.height - this.bbox.y
          )
        );

        this.bbox.y = obstacle.y + obstacle.height;
        this.bbox.height = this.bbox.height - top.bbox.height;
        top.subdivide(obstacles);
        this.childs.push(top);
      }
    }
  }
}
