import { Box2D } from "../box";
import { Triangle } from "../navmesh/triangle";
import { Vector2 } from "../vector";

class Render {
  context: CanvasRenderingContext2D;
  clearColor: string = "#000";
  canvas: HTMLCanvasElement;

  constructor(
    width: number = window.innerWidth,
    height: number = window.innerHeight
  ) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext("2d")!;
    this.init();
  }

  init(): void {
    if (document.readyState === "complete") {
      this.loadCanvas();
    } else {
      window.onload = this.loadCanvas;
    }
  }

  translation: Vector2 = new Vector2(0, 0);

  setTranslation(x: number, y: number): void {
    const dx = x - this.translation.x;
    const dy = y - this.translation.y;
    this.translation.x += dx;
    this.translation.y += dy;
    this.context.translate(dx, dy);
  }


  // setTranslation(x: number, y: number): void {
  //   // We need to keep all the previous transformations
  //   // but with x and y as the translation
  //   const { a, b, c, d } = this.context.getTransform();
  //   this.context.setTransform(a, b, c, d, x, y);
  // }

  zoom(scale: number): void {
    this.context.scale(scale, scale);
  }

  clear(): void {
    this.context.fillStyle = this.clearColor;
    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    this.context.restore();
  }

  private loadCanvas = () => {
    document.body.appendChild(this.canvas);
    window.addEventListener("resize", this.resize);
  };

  private resize = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  fillRect(bbox: Box2D, color: string): void {
    this.context.fillStyle = color;
    this.context.fillRect(bbox.x, bbox.y, bbox.width, bbox.height);
  }

  strokeRect(bbox: Box2D, color: string): void {
    this.context.strokeStyle = color;
    this.context.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
  }

  fillCircle(x: number, y: number, radius: number, color: string): void {
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, 2 * Math.PI);
    this.context.fill();
  }

  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    lineWidth: number = 1
  ): void {
    this.context.strokeStyle = color;
    this.context.lineWidth = lineWidth;
    this.context.beginPath();
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
    this.context.lineWidth = 1;
  }

  static drawPolygon(
    context: CanvasRenderingContext2D,
    vertices: number[],
    color: string
  ): void {
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(vertices[0], vertices[1]);

    for (let i = 2; i < vertices.length; i += 2) {
      context.lineTo(vertices[i], vertices[i + 1]);
    }

    context.closePath();
    context.fill();
  }

  drawTriangle(triangle: Triangle, color: string): void {
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.moveTo(triangle.a.x, triangle.a.y);
    this.context.lineTo(triangle.b.x, triangle.b.y);
    this.context.lineTo(triangle.c.x, triangle.c.y);
    this.context.closePath();
    this.context.fill();
  }
}

export default Render;
