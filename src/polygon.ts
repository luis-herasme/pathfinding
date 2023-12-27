import { Box2D } from "./box";
import PolygonClipping from "polygon-clipping";

type Point = [number, number];

export class Polygon {
  readonly vertices: Point[];
  private boundingBox: Box2D | null = null;
  private translationX: number = 0;
  private translationY: number = 0;

  constructor(vertices: Point[]) {
    this.vertices = vertices;
  }

  translate(x: number, y: number) {
    this.translationX += x;
    this.translationY += y;

    this.vertices.forEach((vertex) => {
      vertex[0] += x;
      vertex[1] += y;
    });
  }

  setTranslation(x: number, y: number) {
    const dx = x - this.translationX;
    const dy = y - this.translationY;

    this.translate(dx, dy);
  }

  getBoundingBox(): Box2D {
    if (this.boundingBox) {
      return this.boundingBox;
    }

    return this.computeBoundingBox();
  }

  computeBoundingBox() {
    const xs = this.vertices.map((vertex) => vertex[0]);
    const ys = this.vertices.map((vertex) => vertex[1]);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    this.boundingBox = new Box2D(minX, minY, maxX - minX, maxY - minY);
    return this.boundingBox;
  }

  static createBox(x: number, y: number, width: number, height: number) {
    return new Polygon([
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
    ]);
  }

  static merge(polygons: Polygon[]): Polygon[] {
    const result = PolygonClipping.union(
      polygons.map((polygon) => [polygon.vertices])
    );

    return result.map((polygon) => new Polygon(polygon[0]));
  }
}
