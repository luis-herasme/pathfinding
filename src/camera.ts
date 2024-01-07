import { Vector2 } from "./vector";
import { keysDown } from "./input";
import Render2D from "./render2d/render";

export function getTransformedPoint(
  x: number,
  y: number,
  context: CanvasRenderingContext2D
) {
  const originalPoint = new DOMPoint(x, y);
  return context.getTransform().invertSelf().transformPoint(originalPoint);
}

export class Camera {
  private position: Vector2 = new Vector2(0, 0);
  private velocity: Vector2 = new Vector2(0, 0);
  private acceleration: Vector2 = new Vector2(0, 0);
  private frictionCoefficient = 4000;
  private speed = 6000;
  private render: Render2D;

  constructor(render: Render2D) {
    this.render = render;
    window.addEventListener("wheel", this.onWheel);
  }

  addForce(force: Vector2) {
    this.acceleration.add(force);
  }

  update(dt: number) {
    this.listenForInput(dt);

    this.velocity.add(this.acceleration);
    this.position.add(Vector2.multiplyByScalar(this.velocity, dt));
    this.acceleration.multiplyByScalar(0);

    if (this.velocity.magnitude() < 10) {
      this.velocity.multiplyByScalar(0);
      return;
    }

    const friction = this.velocity
      .clone()
      .normalize()
      .multiplyByScalar(-this.frictionCoefficient * dt);

    this.velocity.add(friction);
    this.render.setTranslation(this.position.x, this.position.y);
  }

  private onWheel = (event: WheelEvent) => {
    const currentTransformedCursor = getTransformedPoint(
      event.offsetX,
      event.offsetY,
      this.render.context
    );

    const zoom = event.deltaY < 0 ? 1.1 : 0.9;

    this.render.context.translate(
      currentTransformedCursor.x,
      currentTransformedCursor.y
    );

    this.render.context.scale(zoom, zoom);

    this.render.context.translate(
      -currentTransformedCursor.x,
      -currentTransformedCursor.y
    );
  };

  private listenForInput(dt: number) {
    if (keysDown.has("w")) {
      this.addForce(new Vector2(0, this.speed * dt));
    }

    if (keysDown.has("s")) {
      this.addForce(new Vector2(0, -this.speed * dt));
    }

    if (keysDown.has("a")) {
      this.addForce(new Vector2(this.speed * dt, 0));
    }

    if (keysDown.has("d")) {
      this.addForce(new Vector2(-this.speed * dt, 0));
    }
  }
}
