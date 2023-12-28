import { Triangle } from "../navmesh/triangle";

class Render {
  context: CanvasRenderingContext2D;
  clearColor: string = "#FFFFFF";
  canvas: HTMLCanvasElement;

  constructor(
    width: number = window.innerWidth,
    height: number = window.innerHeight
  ) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext("2d")!;
  }

  init(): void {
    if (document.readyState === "complete") {
      this.loadCanvas();
    } else {
      window.onload = this.loadCanvas;
    }
  }

  clear(): void {
    this.context.fillStyle = this.clearColor;
    this.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  private loadCanvas = () => {
    document.body.appendChild(this.canvas);
    window.addEventListener("resize", this.resize);
  };

  private resize = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  static drawRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ): void {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
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
