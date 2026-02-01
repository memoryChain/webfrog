import { state } from "../core/state.js";

export function addRipple(x, y, intensity = 1) {
  state.ripples.push({ x, y, r: 1, a: 0.9 * intensity });
}

export function updateRipples(dt) {
  state.ripples.forEach((r) => {
    r.r += dt * 40;
    r.a -= dt * 0.6;
  });
  state.ripples = state.ripples.filter((r) => r.a > 0);
}
