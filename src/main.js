import { VIRTUAL_W, VIRTUAL_H } from "./core/config.js";
import { state } from "./core/state.js";
import { bindInput } from "./core/input.js";
import { update } from "./core/update.js";
import { drawScene } from "./render/scene.js";
import { setupBgm } from "./audio/bgm.js";
import { initOverlay } from "./ui/overlay.js";
import { initGameOver, updateGameOverUI } from "./ui/gameover.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const buffer = document.createElement("canvas");
buffer.width = VIRTUAL_W;
buffer.height = VIRTUAL_H;
const bctx = buffer.getContext("2d");

function resize() {
  const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const scale = Math.max(vw / VIRTUAL_W, vh / VIRTUAL_H);
  canvas.width = VIRTUAL_W * scale;
  canvas.height = VIRTUAL_H * scale;
  canvas.style.width = `${VIRTUAL_W * scale}px`;
  canvas.style.height = `${VIRTUAL_H * scale}px`;
}

window.addEventListener("resize", resize);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", resize);
}
resize();

bindInput(canvas);
initOverlay();
initGameOver();
setupBgm();

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  drawScene(bctx);
  updateGameOverUI();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
