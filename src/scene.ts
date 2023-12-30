import Stats from "stats.js";
import { Camera } from "./camera";
import Render from "./render/render";
import { World } from "./bodies/world";

export class Scene {
  private camera: Camera;
  private lastTime: number = Date.now();
  private stats: Stats;
  private render: Render;
  private world: World;

  constructor(render: Render, world: World) {
    this.world = world;
    this.render = render;
    this.camera = new Camera(render);
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);
  }

  private getDelta() {
    const currentTime = Date.now();
    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    return dt;
  }

  onUpdate: (dt: number) => void = () => {};

  start() {
    this.update();
  }

  private update = () => {
    this.stats.begin();
    const dt = this.getDelta();
    this.world.update();
    this.render.clear();
    this.camera.update(dt);

    this.onUpdate(dt);

    for (const body of this.world.bodies) {
      body.render(this.render);
    }

    this.stats.end();
    requestAnimationFrame(this.update);
  };
}
