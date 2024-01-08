import Stats from "stats.js";
import { World } from "./bodies/world";

export class SceneManager {
  private lastTime: number = Date.now();
  private stats: Stats;
  private world: World;

  constructor(world: World) {
    this.world = world;
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
    this.world.update(dt);

    this.onUpdate(dt);

    this.stats.end();
    requestAnimationFrame(this.update);
  };
}
