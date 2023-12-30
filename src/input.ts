export const keysDown = new Set<string>();

window.addEventListener("keydown", (e) => {
  keysDown.add(e.key.toLowerCase());
});

window.addEventListener("keyup", (e) => {
  keysDown.delete(e.key.toLowerCase());
});
