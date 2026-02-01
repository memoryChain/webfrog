import {
  DRAG,
  WATER_DRAG,
  STOP_EPS,
} from "./config.js";
import { state } from "./state.js";
import { updateCamera } from "./camera.js";
import { addRipple, updateRipples } from "../fx/ripple.js";
import { updatePickups, ensurePickups } from "../entities/pickups.js";
import { maybeOpenUpgrade } from "../ui/overlay.js";
import { updateEnemies, ensureEnemies } from "../entities/enemies.js";
import { updatePopups } from "../ui/popups.js";

export function update(dt) {
  if (state.paused) return;
  state.time += dt;
  const frog = state.frog;

  if (frog.cooldown > 0) frog.cooldown -= dt * 60;

  frog.x += frog.vx;
  frog.y += frog.vy;

  frog.vx *= WATER_DRAG;
  frog.vy *= WATER_DRAG;

  if (Math.abs(frog.vx) < STOP_EPS) frog.vx *= DRAG;
  if (Math.abs(frog.vy) < STOP_EPS) frog.vy *= DRAG;

  frog.bob = Math.sin(state.time * 2.2) * 1.2;
  const speed = Math.hypot(frog.vx, frog.vy);
  if (speed > 0.2) {
    frog.jumpPhase += dt * (4 + speed * 2);
    frog.faceAngle = Math.atan2(frog.vy, frog.vx);
  } else {
    frog.jumpPhase *= 0.95;
  }

  if (speed < 0.05 && frog.cooldown <= 0) {
    frog.energy = Math.min(frog.maxEnergy, frog.energy + state.stats.regen);
  }

  state.distance += speed * 0.5;
  const upgradeStep = 60 + state.stage * 20;
  if (state.score - state.lastDistanceCheck >= upgradeStep) {
    state.lastDistanceCheck = state.score;
    maybeOpenUpgrade();
  }

  // evolution by score
  for (let i = state.stageScore.length - 1; i >= 1; i--) {
    if (state.score >= state.stageScore[i]) {
      state.stage = i + 1;
      break;
    }
  }
  const maxStage = state.stageScore.length;
  if (state.stage > maxStage) state.stage = maxStage;
  const stageScale = 0.68 + state.stage * 0.09;
  state.frog.sizeScale = stageScale;
  const targetZoom = Math.max(0.45, 1.0 - state.stage * 0.15);
  state.camera.zoom += (targetZoom - state.camera.zoom) * 0.12;

  state.enemySpawnTimer += dt;
  state.pickupSpawnTimer += dt;
  updateCamera();
  updateRipples(dt);
  updatePickups();
  ensurePickups();
  updateEnemies(dt);
  ensureEnemies();
  updatePopups(dt);
  state.tongueRecoil = Math.max(0, state.tongueRecoil - dt * 2.5);
  state.hurtFlash = Math.max(0, state.hurtFlash - dt * 1.8);

  if (frog.energy <= 0) {
    state.gameOver = true;
    state.paused = true;
  }

  if (Math.hypot(frog.vx, frog.vy) > 0.6 && Math.random() < 0.15) {
    addRipple(frog.x + frog.vx * 2, frog.y + frog.vy * 2, 0.5);
  }
}
