import { state } from "../core/state.js";
import { worldToScreen, addCameraShake } from "../core/camera.js";
import { addPopup } from "../ui/popups.js";
import { hash2d } from "../core/math.js";

const pickups = [];

export function spawnPickupNear(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 30 + Math.random() * 60;
  pickups.push({
    x: x + Math.cos(angle) * radius,
    y: y + Math.sin(angle) * radius,
    r: 3.5,
    type: Math.random() < 0.7 ? "bubble" : "bug",
  });
}

export function updatePickups() {
  const frog = state.frog;
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    const dist = Math.hypot(p.x - frog.x, p.y - frog.y);
    if (dist < p.r + 6) {
      if (p.type === "bug") {
        const bonus = state.stats.bugBonus || 1;
        state.frog.energy = Math.min(state.frog.maxEnergy, state.frog.energy + 12 * bonus);
        const gain = Math.round(8 * bonus);
        state.score += gain;
        addPopup(`+${gain}`, p.x, p.y - 6, "#facc15");
        addCameraShake(2.5);
      } else {
        const bonus = state.stats.bubbleBonus || 1;
        state.frog.energy = Math.min(state.frog.maxEnergy, state.frog.energy + 6 * bonus);
        const gain = Math.round(4 * bonus);
        state.score += gain;
        addPopup(`+${gain}`, p.x, p.y - 6, "#7dd3fc");
        addCameraShake(1.5);
      }
      pickups.splice(i, 1);
    }
  }
}

export function drawPickups(bctx) {
  pickups.forEach((p) => {
    const pos = worldToScreen(p.x, p.y);
    if (p.type === "bug") {
      bctx.fillStyle = "#fb7185";
      bctx.beginPath();
      bctx.ellipse(pos.x, pos.y, 3.5, 2.5, 0, 0, Math.PI * 2);
      bctx.fill();
      bctx.fillStyle = "#fef3c7";
      bctx.fillRect(pos.x - 1, pos.y - 1, 1, 1);
    } else {
      bctx.strokeStyle = "rgba(148, 197, 255, 0.9)";
      bctx.beginPath();
      bctx.ellipse(pos.x, pos.y, 3.5, 3.5, 0, 0, Math.PI * 2);
      bctx.stroke();
    }
  });
}

export function ensurePickups() {
  // remove far pickups to keep density around player
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    const dist = Math.hypot(p.x - state.frog.x, p.y - state.frog.y);
    if (dist > 220) pickups.splice(i, 1);
  }
  const cap = 16;
  if (pickups.length >= cap) return;
  if (state.pickupSpawnTimer > 0.9) {
    spawnPickupNear(state.frog.x, state.frog.y);
    spawnPickupNear(state.frog.x, state.frog.y);
    state.pickupSpawnTimer = 0;
  } else {
    const seed = Math.floor(state.time * 4) % 60;
    if (hash2d(seed, seed + 10) > 0.5) {
      spawnPickupNear(state.frog.x, state.frog.y);
    }
  }
}
