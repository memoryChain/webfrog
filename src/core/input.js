import { state } from "./state.js";
import { screenToWorld } from "./camera.js";
import { CHARGE_MAX, FORCE_MAX, FORCE_MIN } from "./config.js";
import { addRipple } from "../fx/ripple.js";

export function bindInput(canvas) {
  canvas.addEventListener("pointerdown", (e) => onPointerDown(e, canvas));
  canvas.addEventListener("pointermove", (e) => onPointerMove(e, canvas));
  window.addEventListener("pointerup", onPointerUp);
}

function onPointerDown(e, canvas) {
  if (state.paused) return;
  if (state.frog.cooldown > 0) return;
  if (state.frog.energy < state.stats.energyCost) return;
  const pos = screenToWorld(e.clientX, e.clientY, canvas);
  state.aiming = true;
  state.aim = pos;
  state.charge = 0;
  state.chargeStart = performance.now();
  state.lastAimDist = Math.hypot(state.aim.x - state.frog.x, state.aim.y - state.frog.y);
  state.lastChargeAmount = 0;
}

function onPointerMove(e, canvas) {
  if (!state.aiming) return;
  state.aim = screenToWorld(e.clientX, e.clientY, canvas);
  state.lastAimDist = Math.hypot(state.aim.x - state.frog.x, state.aim.y - state.frog.y);
}

function onPointerUp() {
  if (!state.aiming) return;
  const frog = state.frog;
  const dx = state.aim.x - frog.x;
  const dy = state.aim.y - frog.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) {
    state.aiming = false;
    return;
  }
  const hold = Math.min(
    CHARGE_MAX,
    (performance.now() - state.chargeStart) / 600
  );
  const chargeAmount = Math.min(1, hold / CHARGE_MAX);
  state.lastChargeAmount = chargeAmount;
  const effectiveDist = dist * state.stats.tongueReach;
  const basePower = FORCE_MIN + effectiveDist * 0.03 + hold * 2.0;
  const power = Math.min(
    FORCE_MAX * state.stats.powerMult,
    basePower * state.stats.powerMult
  );
  frog.vx = (-dx / dist) * power;
  frog.vy = (-dy / dist) * power;
  frog.faceAngle = Math.atan2(frog.vy, frog.vx);
  frog.cooldown = 20;
  frog.energy = Math.max(0, frog.energy - state.stats.energyCost);
  addRipple(frog.x, frog.y, 1);
  state.tongueRecoil = 1;
  state.aiming = false;
}
