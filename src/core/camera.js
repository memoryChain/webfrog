import { VIRTUAL_W, VIRTUAL_H, CAMERA_SMOOTH } from "./config.js";
import { state } from "./state.js";

export function worldToScreen(wx, wy) {
  const zoom = state.camera.zoom || 1;
  return {
    x: (wx - state.camera.x) * zoom + VIRTUAL_W / 2 + state.camera.shakeX,
    y: (wy - state.camera.y) * zoom + VIRTUAL_H / 2 + state.camera.shakeY,
  };
}

export function screenToWorld(clientX, clientY, canvas) {
  const rect = canvas.getBoundingClientRect();
  const sx = ((clientX - rect.left) / rect.width) * VIRTUAL_W;
  const sy = ((clientY - rect.top) / rect.height) * VIRTUAL_H;
  const zoom = state.camera.zoom || 1;
  return {
    x: state.camera.x + (sx - VIRTUAL_W / 2) / zoom,
    y: state.camera.y + (sy - VIRTUAL_H / 2) / zoom,
  };
}

export function updateCamera() {
  const frog = state.frog;
  state.camera.x += (frog.x - state.camera.x) * CAMERA_SMOOTH;
  state.camera.y += (frog.y - state.camera.y) * CAMERA_SMOOTH;
  if (state.camera.shake > 0) {
    state.camera.shakeX = (Math.random() - 0.5) * state.camera.shake;
    state.camera.shakeY = (Math.random() - 0.5) * state.camera.shake;
    state.camera.shake = Math.max(0, state.camera.shake - 0.3);
  } else {
    state.camera.shakeX = 0;
    state.camera.shakeY = 0;
  }
}

export function addCameraShake(power = 2) {
  state.camera.shake = Math.min(8, state.camera.shake + power);
}
