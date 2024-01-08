import { World } from "./bodies/world";
import { QuadPathfinder } from "./quad-pathfinder";
import { createBoxGeometry } from "./render3d/render";
import { SceneManager } from "./scene";
import { Vector2 } from "./vector";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import * as THREE from "three";

const worldBounds = {
  minX: 0,
  minY: 0,
  maxX: 1024,
  maxY: 1024,
};

const world = World.createRandomWorld({
  worldBounds: worldBounds,
  numberOfBodies: 30,
  size: 50,
  velocity: 200,
});

const scene = new THREE.Scene();

for (const body of world.bodies) {
  scene.add(body.indicator);
}

const box = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(box, material);
scene.add(cube);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1024, 1024),
  new THREE.MeshBasicMaterial({ color: 0x111111 })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.position.x = 512;
ground.position.z = 512;
scene.add(ground);

camera.position.set(0, 1000, 1000);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
new OrbitControls(camera, renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const sceneManager = new SceneManager(world);

let lastFrameGroup: THREE.Group = new THREE.Group();

const settings = {
  showOccupied: true,
  showEmpty: true,
  showPath: true,
  showSmothPath: true,
  showPortals: true,
  showPathRegions: true,
  maxDepth: 8,
};

const gui = new GUI();

gui.add(settings, "showOccupied").name("Show occupied");
gui.add(settings, "showEmpty").name("Show empty");
gui.add(settings, "showPath").name("Show raw path");
gui.add(settings, "showSmothPath").name("Show smoth path");
gui.add(settings, "showPortals").name("Show portals");
gui.add(settings, "showPathRegions").name("Show path region");
gui.add(settings, "maxDepth", 4, 8, 1).name("Max depth");

function disposeGeometryHierarchy(node: THREE.Object3D) {
  for (let i = node.children.length - 1; i >= 0; i--) {
    const child = node.children[i];
    disposeGeometryHierarchy(child);
    node.remove(child);
  }

  if (node instanceof THREE.Mesh) {
    node.geometry.dispose();
  } else if (node instanceof THREE.Line) {
    node.geometry.dispose();
  }
}

const OCCUPIED_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  side: THREE.BackSide,
});

const EMPTY_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x888888,
  wireframe: true,
  side: THREE.BackSide,
});

const PATH_REGION_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.3,
  side: THREE.DoubleSide,
});

const RED_LINE_MATERIAL = new THREE.LineBasicMaterial({
  color: 0xff0000,
});

const BLUE_LINE_MATERIAL = new THREE.LineBasicMaterial({
  color: 0x0000ff,
});

const GREEN_LINE_MATERIAL = new THREE.LineBasicMaterial({
  color: 0x00ff00,
});

const BASIC_RED_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0xff0000,
});

const BASIC_BLUE_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
});

const CELLS_IN_PATH_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0xccffcc,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide,
});

sceneManager.onUpdate = () => {
  const pathfinder = new QuadPathfinder({
    bounds: worldBounds,
    obstacles: world.bodies,
    maxDepth: settings.maxDepth,
  });

  const result = pathfinder.findPath({
    start: {
      x: worldBounds.minX + 10,
      y: worldBounds.minY + 10,
    },
    end: {
      x: worldBounds.maxX - 10,
      y: worldBounds.maxY - 10,
    },
  });

  const { leaves } = result;

  let path, portals, smothPath, pathCells;

  if (result.pathData) {
    path = result.pathData.path;
    portals = result.pathData.portals;
    smothPath = result.pathData.smothPath;
    pathCells = result.pathData.pathCells;
  }

  disposeGeometryHierarchy(lastFrameGroup);

  if (lastFrameGroup) {
    scene.remove(lastFrameGroup);
  }

  // Draw quadtree
  const occupiedGeometries: number[] = [];
  const emptyGeometries: number[] = [];

  for (const cell of leaves) {
    if (cell.occupied) {
      if (settings.showOccupied) {
        occupiedGeometries.push(...createBoxGeometry(cell.bbox, 2));
      }
    } else {
      if (settings.showEmpty) {
        emptyGeometries.push(...createBoxGeometry(cell.bbox, 2));
      }
    }
  }

  if (settings.showOccupied) {
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(occupiedGeometries, 3)
    );

    const occupiedMesh = new THREE.Mesh(geometry, OCCUPIED_MATERIAL);
    lastFrameGroup.add(occupiedMesh);
  }

  if (settings.showEmpty) {
    const emptyGeometry = new THREE.BufferGeometry();

    emptyGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(emptyGeometries, 3)
    );

    const emptyMesh = new THREE.Mesh(emptyGeometry, EMPTY_MATERIAL);
    lastFrameGroup.add(emptyMesh);
  }

  if (settings.showPath && path) {
    const pathMesh = drawPathLine(path, RED_LINE_MATERIAL);
    pathMesh.position.y = 5;
    lastFrameGroup.add(pathMesh);

    const pathSpheres = drawPathPoints(path, BASIC_RED_MATERIAL);
    pathSpheres.position.y = 5;
    lastFrameGroup.add(pathSpheres);
  }

  if (settings.showSmothPath && smothPath) {
    const smothPathMesh = drawPathLine(smothPath, BLUE_LINE_MATERIAL);
    smothPathMesh.position.y = 10;
    lastFrameGroup.add(smothPathMesh);

    const smothPathSpheres = drawPathPoints(smothPath, BASIC_BLUE_MATERIAL);
    smothPathSpheres.position.y = 10;
    lastFrameGroup.add(smothPathSpheres);
  }
  const PATH_REGION_Y = 15;
  if (settings.showPathRegions && portals) {
    const pathRegionGeometries = [];
    for (let i = 0; i < portals.length - 1; i++) {
      const startRight = portals[i].right;
      const endRight = portals[i + 1].right;
      const startLeft = portals[i].left;
      const endLeft = portals[i + 1].left;

      pathRegionGeometries.push([
        // Front triangle
        startRight.x,
        PATH_REGION_Y,
        startRight.y,

        endRight.x,
        PATH_REGION_Y,
        endRight.y,

        endLeft.x,
        PATH_REGION_Y,
        endLeft.y,

        // Back triangle
        startLeft.x,
        PATH_REGION_Y,
        startLeft.y,

        endLeft.x,
        PATH_REGION_Y,
        endLeft.y,

        startRight.x,
        PATH_REGION_Y,
        startRight.y,
      ]);
    }

    const pathRegionGeometry = new THREE.BufferGeometry();

    pathRegionGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(pathRegionGeometries.flat(), 3)
    );

    const pathRegionMesh = new THREE.Mesh(
      pathRegionGeometry,
      PATH_REGION_MATERIAL
    );
    lastFrameGroup.add(pathRegionMesh);
  }

  if (settings.showPortals && portals) {
    const rightLinePoints = [];
    const leftLinePoints = [];
    const rightToLeftLinePoints = [];
    // Draw portals
    for (let i = 0; i < portals.length - 1; i++) {
      const startRight = portals[i].right;
      const endRight = portals[i + 1].right;

      const startLeft = portals[i].left;
      const endLeft = portals[i + 1].left;

      rightLinePoints.push(
        new THREE.Vector3(startRight.x, PATH_REGION_Y, startRight.y),
        new THREE.Vector3(endRight.x, PATH_REGION_Y, endRight.y)
      );
      leftLinePoints.push(
        new THREE.Vector3(startLeft.x, PATH_REGION_Y, startLeft.y),
        new THREE.Vector3(endLeft.x, PATH_REGION_Y, endLeft.y)
      );
      rightToLeftLinePoints.push(
        new THREE.Vector3(startLeft.x, PATH_REGION_Y, startLeft.y),
        new THREE.Vector3(startRight.x, PATH_REGION_Y, startRight.y),
        new THREE.Vector3(endRight.x, PATH_REGION_Y, endRight.y),
        new THREE.Vector3(endLeft.x, PATH_REGION_Y, endLeft.y)
      );
      // const rightToLeftLine = new THREE.Line(
      //   new THREE.BufferGeometry().setFromPoints([
      //     new THREE.Vector3(startRight.x, 30, startRight.y),
      //     new THREE.Vector3(startLeft.x, 30, startLeft.y),
      //   ]),
      //   GREEN_LINE_MATERIAL
      // );

      // lastFrameGroup.add(rightToLeftLine);
    }
    const rightLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(rightLinePoints),
      GREEN_LINE_MATERIAL
    );

    const leftLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(leftLinePoints),
      GREEN_LINE_MATERIAL
    );

    const rightToLeftLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(rightToLeftLinePoints),
      GREEN_LINE_MATERIAL
    );

    lastFrameGroup.add(rightLine);
    lastFrameGroup.add(leftLine);
    lastFrameGroup.add(rightToLeftLine);
  }

  // Draw cells in path
  if (pathCells) {
    const cellsInPathGeometries: number[] = [];
    for (const cell of pathCells) {
      cellsInPathGeometries.push(...createBoxGeometry(cell.bbox, 2));
    }

    const cellsInPathGeometry = new THREE.BufferGeometry();

    cellsInPathGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(cellsInPathGeometries, 3)
    );

    const cellsInPathMesh = new THREE.Mesh(
      cellsInPathGeometry,
      CELLS_IN_PATH_MATERIAL
    );

    lastFrameGroup.add(cellsInPathMesh);
  }
  scene.add(lastFrameGroup);

  renderer.render(scene, camera);
};

function drawPathLine(
  path: Vector2[],
  material: THREE.LineBasicMaterial
): THREE.Line {
  const y = 10;
  const pathPoints = [];

  for (let i = 0; i < path.length; i++) {
    pathPoints.push(new THREE.Vector3(path[i].x, y, path[i].y));
  }

  const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const line = new THREE.Line(pathGeometry, material);
  return line;
}

function drawPathPoints(path: Vector2[], material: THREE.Material): THREE.Mesh {
  const geometries = [];
  const y = 10;
  const SIZE = 5;

  for (let i = 0; i < path.length; i++) {
    const BOX_INDICATOR = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
    geometries.push(BOX_INDICATOR.translate(path[i].x, y, path[i].y));
  }

  const geometry = BufferGeometryUtils.mergeGeometries(geometries);
  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

sceneManager.start();
