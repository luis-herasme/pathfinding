import { World } from "./bodies/world";
import { QuadPathfinder } from "./quad-pathfinder";
import { SceneManager } from "./scene";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREE from "three";
import { Box2D } from "./box";
import { drawPathLine, drawPathPoints } from "./render";
import {
  BASIC_BLUE_MATERIAL,
  BASIC_RED_MATERIAL,
  BLUE_LINE_MATERIAL,
  CELLS_IN_PATH_MATERIAL,
  EMPTY_MATERIAL,
  GREEN_LINE_MATERIAL,
  OCCUPIED_MATERIAL,
  PATH_REGION_MATERIAL,
  RED_LINE_MATERIAL,
} from "./materials";

const worldBounds = new Box2D(0, 0, 1024, 1024);

const world = World.createRandomWorld({
  worldBounds: worldBounds,
  numberOfBodies: 30,
  velocity: 200,
  size: 50,
});

const sceneManager = new SceneManager(world);

for (const body of world.bodies) {
  sceneManager.scene.add(body.indicator);
}

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1024, 1024),
  new THREE.MeshBasicMaterial({ color: 0x111111 })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
ground.position.x = 512;
ground.position.z = 512;
sceneManager.scene.add(ground);

let lastFrameGroup: THREE.Group = new THREE.Group();

const settings = {
  showOccupied: true,
  showEmpty: true,
  showPath: true,
  showSmothPath: true,
  showPortals: true,
  showPathRegions: true,
  maxDepth: 6,
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
    sceneManager.scene.remove(lastFrameGroup);
  }

  // Draw quadtree
  const occupiedGeometries: number[] = [];
  const emptyGeometries: number[] = [];

  for (const cell of leaves) {
    if (cell.occupied) {
      occupiedGeometries.push(...cell.bbox.getGeometry());
    } else {
      emptyGeometries.push(...cell.bbox.getGeometry());
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
      cellsInPathGeometries.push(...cell.bbox.getGeometry());
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

  sceneManager.scene.add(lastFrameGroup);
};

sceneManager.start();
