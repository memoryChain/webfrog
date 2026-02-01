import { state } from "../core/state.js";
import { worldToScreen } from "../core/camera.js";

const popups = [];

export function addPopup(text, x, y, color) {
  popups.push({
    text,
    x,
    y,
    vy: -0.15,
    life: 1.4,
    color,
  });
}

export function updatePopups(dt) {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.y += p.vy * 10;
    p.life -= dt * 0.7;
    if (p.life <= 0) popups.splice(i, 1);
  }
}

export function drawPopups(bctx) {
  popups.forEach((p) => {
    const pos = worldToScreen(p.x, p.y);
    bctx.globalAlpha = Math.max(0, p.life);
    bctx.fillStyle = p.color;
    bctx.font = "12px Microsoft YaHei UI";
    bctx.fillText(p.text, pos.x - 6, pos.y - 6);
    bctx.globalAlpha = 1;
  });
}
