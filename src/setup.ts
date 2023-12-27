import Stats from "stats.js";
import { MapControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

export const PADDING = 5;
export const GROUND_SIZE = 100;

export function setupScene() {
  // Setup scene
  const stats = new Stats();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  camera.position.z = 100;
  camera.position.y = 100;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(stats.dom);
  document.body.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  directionalLight.position.set(0, 10, 0);
  scene.add(ambientLight);
  scene.add(directionalLight);

  // Add axes helper
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
    new THREE.MeshBasicMaterial({ color: 0xcccccc })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.x = GROUND_SIZE / 2;
  ground.position.z = GROUND_SIZE / 2;
  // scene.add(ground);

  // Controls
  const controls = new MapControls(camera, renderer.domElement);

  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  onResize();
  window.addEventListener("resize", onResize);

  function animate() {
    requestAnimationFrame(animate);
    stats.begin();
    controls.update();
    renderer.render(scene, camera);
    stats.end();
  }

  animate();

  return {
    scene,
    camera,
  };
}
