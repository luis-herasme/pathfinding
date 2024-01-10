import { World } from "./bodies/world";
import { QuadPathfinder } from "./quad-pathfinder";
import { SceneManager } from "./scene";
import { Box2D } from "./box";
import {
  BASIC_BLUE_MATERIAL,
  BASIC_RED_MATERIAL,
  BLUE_LINE_MATERIAL,
  RED_LINE_MATERIAL,
} from "./materials";
import { PathLineVisualizer } from "./visualizers/path-line-visualizer";
import { CellsVisualizer } from "./visualizers/cells-visualizer";
import { PathCellsVisualizer } from "./visualizers/path-cells-visualizer";
import { PortalsVisualizer } from "./visualizers/portals-visualizer";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

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

const settings = {
  showGrid: true,
  showPath: true,
  showSmothPath: true,
  showPortals: true,
  showPathCells: true,
  maxDepth: 6,
};

const cellsVisualizer = new CellsVisualizer();
const pathCellsVisualizer = new PathCellsVisualizer();
const portalsVisualizer = new PortalsVisualizer();

const smothPathVisualizer = new PathLineVisualizer({
  lineMaterial: BLUE_LINE_MATERIAL,
  pointsMaterial: BASIC_BLUE_MATERIAL,
});

const rawPathVisualizer = new PathLineVisualizer({
  lineMaterial: RED_LINE_MATERIAL,
  pointsMaterial: BASIC_RED_MATERIAL,
});

smothPathVisualizer.scene.position.y = 20;
rawPathVisualizer.scene.position.y = 20;
portalsVisualizer.scene.position.y = 10;

sceneManager.scene.add(smothPathVisualizer.scene);
sceneManager.scene.add(rawPathVisualizer.scene);
sceneManager.scene.add(cellsVisualizer.scene);
sceneManager.scene.add(pathCellsVisualizer.scene);
sceneManager.scene.add(portalsVisualizer.scene);

const gui = new GUI();

gui
  .add(settings, "showGrid")
  .name("Show grid")
  .onChange((value) => {
    cellsVisualizer.scene.visible = value;
  });

gui
  .add(settings, "showPath")
  .name("Show raw path")
  .onChange((value) => {
    rawPathVisualizer.scene.visible = value;
  });

gui
  .add(settings, "showSmothPath")
  .name("Show smoth path")
  .onChange((value) => {
    smothPathVisualizer.scene.visible = value;
  });

gui
  .add(settings, "showPortals")
  .name("Show portals")
  .onChange((value) => {
    portalsVisualizer.scene.visible = value;
  });

gui
  .add(settings, "showPathCells")
  .name("Show path quads")
  .onChange((value) => {
    pathCellsVisualizer.scene.visible = value;
  });

gui
  .add(settings, "maxDepth", 4, 8, 1)
  .name("Max depth")
  .onChange((value) => {
    settings.maxDepth = value;
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

  const { leaves, path, smothPath, portals, pathCells } = result;

  if (settings.showGrid) {
    cellsVisualizer.update(leaves);
  }

  if (settings.showPath && path) {
    rawPathVisualizer.update(path);
  }

  if (settings.showSmothPath && smothPath) {
    smothPathVisualizer.update(smothPath);
  }

  if (settings.showPortals && portals) {
    portalsVisualizer.update(portals);
  }

  if (settings.showPathCells && pathCells) {
    pathCellsVisualizer.update(pathCells);
  }
};

sceneManager.start();
