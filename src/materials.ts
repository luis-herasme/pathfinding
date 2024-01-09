import * as THREE from "three";

export const OCCUPIED_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  side: THREE.BackSide,
});

export const EMPTY_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x888888,
  wireframe: true,
  side: THREE.BackSide,
});

export const PATH_REGION_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.3,
  side: THREE.DoubleSide,
});

export const RED_LINE_MATERIAL = new THREE.LineBasicMaterial({
  color: 0xff0000,
});

export const BLUE_LINE_MATERIAL = new THREE.LineBasicMaterial({
  color: 0x0000ff,
});

export const GREEN_LINE_MATERIAL = new THREE.LineBasicMaterial({
  color: 0x00ff00,
});

export const BASIC_RED_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0xff0000,
});

export const BASIC_BLUE_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
});

export const CELLS_IN_PATH_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0xccffcc,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide,
});
