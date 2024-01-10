import Stats from "stats.js";
import { World } from "./world/world";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class SceneManager {
  private stats: Stats;
  private world: World;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  scene = new THREE.Scene();

  constructor(world: World) {
    this.world = world;

    // Setup stats
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 1000, 1000);
    this.camera.lookAt(0, 0, 0);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x111111);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    window.addEventListener("resize", this.onResize);

    // Setup controls
    new OrbitControls(this.camera, this.renderer.domElement);
  }

  private onResize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };

  onUpdate: (dt: number) => void = () => {};

  start() {
    this.update();
  }

  private update = () => {
    this.stats.begin();
    const dt = this.clock.getDelta();
    this.world.update(dt);

    this.onUpdate(dt);

    this.stats.end();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.update);
  };
}
