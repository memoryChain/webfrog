import { VIRTUAL_W, VIRTUAL_H, CHARGE_MAX } from "../core/config.js";
import { state } from "../core/state.js";
import { worldToScreen } from "../core/camera.js";
import { hash2d } from "../core/math.js";
import { drawPickups } from "../entities/pickups.js";
import { drawEnemies } from "../entities/enemies.js";
import { drawPopups } from "../ui/popups.js";

export function drawScene(bctx) {
  bctx.clearRect(0, 0, VIRTUAL_W, VIRTUAL_H);
  drawWater(bctx);
  drawLilyPads(bctx);
  drawReeds(bctx);
  drawRocks(bctx);
  drawFireflies(bctx);
  drawDriftwood(bctx);
  drawPetals(bctx);
  drawRipples(bctx);
  drawPickups(bctx);
  drawEnemies(bctx);
  drawFrog(bctx);
  drawTongueBack(bctx);
  drawTongueTip(bctx);
  drawPopups(bctx);
  drawChargeUI(bctx);
  drawHud(bctx);
  drawHurtFlash(bctx);
}

function drawWater(bctx) {
  const stage = state.stage;
  const zoom = state.camera.zoom || 1;
  const waterPalette = [
    ["#0b3b59", "#0f4b6e"],
    ["#0b4561", "#135b78"],
    ["#0b4c72", "#156189"],
    ["#12305f", "#1b3f73"],
    ["#1e293b", "#334155"],
  ];
  const colors = waterPalette[Math.min(stage - 1, waterPalette.length - 1)];
  const grad = bctx.createLinearGradient(0, 0, 0, VIRTUAL_H);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  bctx.fillStyle = grad;
  bctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

  const tile = 16;
  const halfW = VIRTUAL_W / (2 * zoom);
  const halfH = VIRTUAL_H / (2 * zoom);
  const left = state.camera.x - halfW;
  const top = state.camera.y - halfH;
  const startX = Math.floor(left / tile) * tile - tile;
  const startY = Math.floor(top / tile) * tile - tile;
  const endX = left + halfW * 2 + tile;
  const endY = top + halfH * 2 + tile;

  // soft shimmer
  for (let wy = startY; wy < endY; wy += tile) {
    for (let wx = startX; wx < endX; wx += tile) {
      const t = Math.sin((wx + state.time * 12) * 0.02 + wy * 0.015) * 2;
      const alphaBoost = stage >= 4 ? 0.04 : stage >= 3 ? 0.03 : 0.02;
      const alpha = 0.02 + (t + 2) * 0.01 + alphaBoost;
      const pos = worldToScreen(wx, wy);
      bctx.fillStyle = `rgba(148,197,255,${alpha})`;
      bctx.beginPath();
      bctx.ellipse(pos.x + 4, pos.y + 4, 6, 2, 0, 0, Math.PI * 2);
      bctx.fill();
    }
  }
}

function drawLilyPads(bctx) {
  const stage = state.stage;
  const zoom = state.camera.zoom || 1;
  const cell = 28;
  const halfW = VIRTUAL_W / (2 * zoom);
  const halfH = VIRTUAL_H / (2 * zoom);
  const left = state.camera.x - halfW;
  const top = state.camera.y - halfH;
  const startX = Math.floor(left / cell) - 1;
  const startY = Math.floor(top / cell) - 1;
  const endX = Math.floor((left + halfW * 2) / cell) + 1;
  const endY = Math.floor((top + halfH * 2) / cell) + 1;

  for (let gy = startY; gy <= endY; gy++) {
    for (let gx = startX; gx <= endX; gx++) {
      const chance = hash2d(gx, gy);
      if (chance < 0.65) continue;
      const jitterX = (hash2d(gx + 11.3, gy + 9.2) - 0.5) * 10;
      const jitterY = (hash2d(gx + 3.7, gy + 5.1) - 0.5) * 10;
      const wx = gx * cell + cell * 0.5 + jitterX;
      const wy = gy * cell + cell * 0.5 + jitterY;
      const pos = worldToScreen(wx, wy);
      const size = 8 + chance * 9;
      const rot = (hash2d(gx + 4.2, gy + 2.8) - 0.5) * 0.6;
      const slice = hash2d(gx + 9.1, gy + 1.3);
      const padPalette = [
        "#0f766e",
        "#0f8a73",
        "#0ea5a4",
        "#0e7490",
        "#475569",
      ];
      bctx.fillStyle = padPalette[Math.min(stage - 1, padPalette.length - 1)];
      bctx.beginPath();
      bctx.ellipse(pos.x, pos.y, size, size * (0.6 + slice * 0.2), rot, 0, Math.PI * 2);
      bctx.fill();

      const rim = stage >= 5 ? "rgba(148,163,184,0.6)" : "rgba(45, 212, 191, 0.7)";
      bctx.strokeStyle = rim;
      bctx.stroke();
      const highlight = stage >= 5 ? "rgba(226,232,240,0.25)" : "rgba(153, 246, 228, 0.35)";
      bctx.fillStyle = highlight;
      bctx.beginPath();
      bctx.ellipse(
        pos.x - size * 0.2,
        pos.y - size * 0.1,
        size * 0.45,
        size * 0.25,
        0,
        0,
        Math.PI * 2
      );
      bctx.fill();

      const vein = stage >= 5 ? "rgba(71,85,105,0.8)" : "rgba(13, 148, 136, 0.9)";
      bctx.strokeStyle = vein;
      bctx.beginPath();
      const notchX = pos.x + Math.cos(rot) * size * 0.65;
      const notchY = pos.y + Math.sin(rot) * size * 0.35;
      bctx.moveTo(pos.x, pos.y);
      bctx.lineTo(notchX, notchY);
      bctx.stroke();

      const vein2 = stage >= 5 ? "rgba(100,116,139,0.5)" : "rgba(94, 234, 212, 0.4)";
      bctx.strokeStyle = vein2;
      bctx.beginPath();
      bctx.moveTo(pos.x - size * 0.3, pos.y - size * 0.1);
      bctx.lineTo(pos.x + size * 0.2, pos.y);
      bctx.moveTo(pos.x - size * 0.1, pos.y + size * 0.2);
      bctx.lineTo(pos.x + size * 0.3, pos.y + size * 0.15);
      bctx.stroke();
    }
  }
}

function drawReeds(bctx) {
  const stage = state.stage;
  const zoom = state.camera.zoom || 1;
  const cell = 36;
  const halfW = VIRTUAL_W / (2 * zoom);
  const halfH = VIRTUAL_H / (2 * zoom);
  const left = state.camera.x - halfW;
  const top = state.camera.y - halfH;
  const startX = Math.floor(left / cell) - 1;
  const startY = Math.floor(top / cell) - 1;
  const endX = Math.floor((left + halfW * 2) / cell) + 1;
  const endY = Math.floor((top + halfH * 2) / cell) + 1;

  for (let gy = startY; gy <= endY; gy++) {
    for (let gx = startX; gx <= endX; gx++) {
      const chance = hash2d(gx + 100, gy + 200);
      if (chance < 0.78) continue;
      const jitterX = (hash2d(gx + 2.1, gy + 8.4) - 0.5) * 12;
      const jitterY = (hash2d(gx + 5.6, gy + 1.9) - 0.5) * 12;
      const wx = gx * cell + cell * 0.5 + jitterX;
      const wy = gy * cell + cell * 0.5 + jitterY;
      const pos = worldToScreen(wx, wy);
      const sway = Math.sin(state.time * 2 + gx) * 2;
      bctx.strokeStyle = stage >= 4 ? "rgba(148,163,184,0.6)" : "rgba(52,211,153,0.7)";
      bctx.beginPath();
      bctx.moveTo(pos.x, pos.y + 6);
      bctx.lineTo(pos.x + sway, pos.y - 6);
      bctx.stroke();
    }
  }
}

function drawRocks(bctx) {
  const stage = state.stage;
  const zoom = state.camera.zoom || 1;
  const cell = 48;
  const halfW = VIRTUAL_W / (2 * zoom);
  const halfH = VIRTUAL_H / (2 * zoom);
  const left = state.camera.x - halfW;
  const top = state.camera.y - halfH;
  const startX = Math.floor(left / cell) - 1;
  const startY = Math.floor(top / cell) - 1;
  const endX = Math.floor((left + halfW * 2) / cell) + 1;
  const endY = Math.floor((top + halfH * 2) / cell) + 1;

  for (let gy = startY; gy <= endY; gy++) {
    for (let gx = startX; gx <= endX; gx++) {
      const chance = hash2d(gx + 300, gy + 600);
      if (chance < 0.88) continue;
      const wx = gx * cell + cell * 0.5;
      const wy = gy * cell + cell * 0.5;
      const pos = worldToScreen(wx, wy);
      const size = 4 + (chance * 4);
      bctx.fillStyle = stage >= 5 ? "rgba(71,85,105,0.6)" : "rgba(100,116,139,0.6)";
      bctx.beginPath();
      bctx.ellipse(pos.x, pos.y, size, size * 0.7, 0, 0, Math.PI * 2);
      bctx.fill();
    }
  }
}

function drawFireflies(bctx) {
  if (state.stage < 3) return;
  const count = 10;
  for (let i = 0; i < count; i++) {
    const wx = Math.sin(state.time * 0.6 + i * 9.1) * 80 + state.camera.x;
    const wy = Math.cos(state.time * 0.5 + i * 7.4) * 60 + state.camera.y;
    const pos = worldToScreen(wx, wy);
    bctx.fillStyle = "rgba(250, 204, 21, 0.7)";
    bctx.beginPath();
    bctx.ellipse(pos.x, pos.y, 1.2, 1.2, 0, 0, Math.PI * 2);
    bctx.fill();
  }
}

function drawDriftwood(bctx) {
  const stage = state.stage;
  const zoom = state.camera.zoom || 1;
  const cell = 70;
  const halfW = VIRTUAL_W / (2 * zoom);
  const halfH = VIRTUAL_H / (2 * zoom);
  const left = state.camera.x - halfW;
  const top = state.camera.y - halfH;
  const startX = Math.floor(left / cell) - 1;
  const startY = Math.floor(top / cell) - 1;
  const endX = Math.floor((left + halfW * 2) / cell) + 1;
  const endY = Math.floor((top + halfH * 2) / cell) + 1;

  for (let gy = startY; gy <= endY; gy++) {
    for (let gx = startX; gx <= endX; gx++) {
      const chance = hash2d(gx + 500, gy + 700);
      if (chance < 0.93) continue;
      const wx = gx * cell + cell * 0.5;
      const wy = gy * cell + cell * 0.5;
      const pos = worldToScreen(wx, wy);
      const len = 10 + chance * 8;
      bctx.strokeStyle = stage >= 4 ? "rgba(148,163,184,0.6)" : "rgba(148,115,81,0.7)";
      bctx.lineWidth = 2;
      bctx.beginPath();
      bctx.moveTo(pos.x - len * 0.5, pos.y);
      bctx.lineTo(pos.x + len * 0.5, pos.y + 2);
      bctx.stroke();
      bctx.lineWidth = 1;
    }
  }
}

function drawPetals(bctx) {
  if (state.stage < 2) return;
  const count = 12;
  for (let i = 0; i < count; i++) {
    const wx = Math.cos(state.time * 0.4 + i * 3.7) * 90 + state.camera.x;
    const wy = Math.sin(state.time * 0.45 + i * 4.1) * 70 + state.camera.y;
    const pos = worldToScreen(wx, wy);
    bctx.fillStyle = "rgba(251, 146, 60, 0.45)";
    bctx.beginPath();
    bctx.ellipse(pos.x, pos.y, 2, 1.2, 0, 0, Math.PI * 2);
    bctx.fill();
  }
}

function drawRipples(bctx) {
  state.ripples.forEach((r) => {
    const pos = worldToScreen(r.x, r.y);
    bctx.strokeStyle = `rgba(148, 197, 255, ${r.a})`;
    bctx.lineWidth = 1;
    bctx.beginPath();
    bctx.ellipse(pos.x, pos.y, r.r, r.r * 0.6, 0, 0, Math.PI * 2);
    bctx.stroke();
  });
}

function drawFrog(bctx) {
  const frog = state.frog;
  const pos = worldToScreen(frog.x, frog.y + frog.bob);
  const x = pos.x;
  const y = pos.y;
  const stage = state.stage;

  const palette = [
    // Stage 1: small & gentle
    { body: "#86efac", head: "#bbf7d0", shadow: "rgba(0,0,0,0.22)", belly: "#dcfce7", leg: "#4ade80", accent: "#166534" },
    // Stage 2: brighter, more confident
    { body: "#34d399", head: "#6ee7b7", shadow: "rgba(0,0,0,0.25)", belly: "#d1fae5", leg: "#10b981", accent: "#047857" },
    // Stage 3: energetic cyan
    { body: "#38bdf8", head: "#7dd3fc", shadow: "rgba(0,0,0,0.3)", belly: "#e0f2fe", leg: "#0284c7", accent: "#0c4a6e" },
    // Stage 4: arcane purple
    { body: "#a855f7", head: "#c084fc", shadow: "rgba(0,0,0,0.32)", belly: "#f3e8ff", leg: "#7c3aed", accent: "#4c1d95" },
    // Stage 5: mechanical steel
    { body: "#94a3b8", head: "#cbd5e1", shadow: "rgba(0,0,0,0.34)", belly: "#e2e8f0", leg: "#64748b", accent: "#0f172a" },
  ];
  const theme = palette[Math.min(stage - 1, palette.length - 1)];

  const speed = Math.hypot(frog.vx, frog.vy);
  const s = frog.sizeScale || 1;
  const jump = speed > 0.15 ? Math.sin(frog.jumpPhase) : 0;
  const chargeHold = state.aiming
    ? Math.min(CHARGE_MAX, (performance.now() - state.chargeStart) / 600)
    : 0;
  const chargeAmount = Math.min(1, chargeHold / CHARGE_MAX);
  const launchAmount = speed > 0.2 ? Math.max(0, jump) : 0;
  const glideAmount = speed > 0.2 ? 1 - launchAmount : 0;
  const stretch = 1 + launchAmount * 0.28 + chargeAmount * 0.1;
  const squash = 1 - Math.max(0, -jump) * 0.2 - chargeAmount * 0.12;

  let faceAngle = frog.faceAngle;
  if (state.aiming) {
    faceAngle = Math.atan2(frog.y - state.aim.y, frog.x - state.aim.x);
  }
  const dirIndex =
    ((Math.round((faceAngle / (Math.PI * 2)) * 12) % 12) + 12) % 12;
  const dirAngle = (dirIndex / 12) * Math.PI * 2;
  const dx = Math.cos(dirAngle);
  const dy = Math.sin(dirAngle);
  const facingFront = dirIndex === 3 || dirIndex === 4 || dirIndex === 5;
  const facingBack = dirIndex === 9 || dirIndex === 10 || dirIndex === 11;
  const facingSide = !facingFront && !facingBack;

  // shadow
  bctx.fillStyle = theme.shadow;
  bctx.beginPath();
  bctx.ellipse(x, y + 6 * s, 11 * s, 4.2 * s, 0, 0, Math.PI * 2);
  bctx.fill();

  // back legs
  bctx.fillStyle = theme.leg;
  const legSwing = jump * 3.2 + chargeAmount * -3.2;
  const legOffX = -dy * 7;
  const legOffY = dx * 7;
  const backStretch = 1 + launchAmount * 0.6 - chargeAmount * 0.25;
  bctx.beginPath();
  bctx.ellipse(
    x + legOffX * s + dx * (4 * launchAmount),
    y + legOffY * s + 4 * s + legSwing - dy * (3 * launchAmount),
    5 * backStretch * s,
    3 * s,
    0.2,
    0,
    Math.PI * 2
  );
  bctx.ellipse(
    x - legOffX * s + dx * (4 * launchAmount),
    y - legOffY * s + 4 * s + legSwing - dy * (3 * launchAmount),
    5 * backStretch * s,
    3 * s,
    -0.2,
    0,
    Math.PI * 2
  );
  bctx.fill();

  // front legs
  const frontLift = launchAmount * 3.2 + chargeAmount * 2.0 - glideAmount * 0.8;
  const frontOffX = -dy * 4.5;
  const frontOffY = dx * 4.5;
  bctx.beginPath();
  bctx.ellipse(
    x + frontOffX * s + dx * 2,
    y + frontOffY * s - 1 * s - frontLift,
    (3.2 + launchAmount * 0.6) * s,
    2.2 * s,
    0.1,
    0,
    Math.PI * 2
  );
  bctx.ellipse(
    x - frontOffX * s + dx * 2,
    y - frontOffY * s - 1 * s - frontLift,
    (3.2 + launchAmount * 0.6) * s,
    2.2 * s,
    -0.1,
    0,
    Math.PI * 2
  );
  bctx.fill();

  // body
  bctx.fillStyle = theme.body;
  bctx.beginPath();
  const bodyW = 10.5 * stretch * (facingSide ? 1.05 : 1) * s;
  const bodyH = 7 * squash * (facingSide ? 0.95 : 1) * s;
  bctx.ellipse(x, y + 1, bodyW, bodyH, 0, 0, Math.PI * 2);
  bctx.fill();
  if (!facingBack) {
    bctx.fillStyle = theme.belly;
    bctx.beginPath();
    bctx.ellipse(x, y + 2 * s, 6 * stretch * s, 4 * squash * s, 0, 0, Math.PI * 2);
    bctx.fill();
  }
  bctx.fillStyle = theme.head;
  bctx.beginPath();
  bctx.ellipse(x, y - 2 * s, 7 * stretch * s, 4.5 * squash * s, 0, 0, Math.PI * 2);
  bctx.fill();

  // head
  bctx.fillStyle = facingBack ? theme.body : theme.head;
  const headPush = (facingFront ? 2.2 : facingBack ? 1.2 : 3.2) * s;
  const headX = x + dx * headPush;
  const headY = y + dy * headPush - 3.5;
  bctx.beginPath();
  const headW = facingFront ? 10.0 : facingBack ? 7.6 : 8.4;
  const headH = facingFront ? 6.8 : facingBack ? 5.4 : 5.8;
  bctx.ellipse(headX, headY, headW * stretch * s, headH * squash * s, 0, 0, Math.PI * 2);
  bctx.fill();

  if (!facingBack) {
    bctx.fillStyle = "rgba(255, 170, 200, 0.65)";
    bctx.beginPath();
    bctx.ellipse(headX - 5 * s + dx * 1.5, headY + 1 * s, 2 * s, 1.5 * s, 0, 0, Math.PI * 2);
    bctx.ellipse(headX + 5 * s + dx * 1.5, headY + 1 * s, 2 * s, 1.5 * s, 0, 0, Math.PI * 2);
    bctx.fill();
  }

  if (facingFront) {
    bctx.fillStyle = theme.leg;
    bctx.beginPath();
    bctx.ellipse(headX - 5.5 * s, headY - 7 * s, 4.2 * s, 4.2 * s, 0, 0, Math.PI * 2);
    bctx.ellipse(headX + 5.5 * s, headY - 7 * s, 4.2 * s, 4.2 * s, 0, 0, Math.PI * 2);
    bctx.fill();
    bctx.fillStyle = "#f8fafc";
    bctx.beginPath();
    bctx.ellipse(headX - 5.5 * s, headY - 7 * s, 2.8 * s, 2.8 * s, 0, 0, Math.PI * 2);
    bctx.ellipse(headX + 5.5 * s, headY - 7 * s, 2.8 * s, 2.8 * s, 0, 0, Math.PI * 2);
    bctx.fill();
    bctx.fillStyle = "#0f172a";
    bctx.beginPath();
    bctx.ellipse(headX - 5.5 * s, headY - 7 * s, 1.1 * s, 1.1 * s, 0, 0, Math.PI * 2);
    bctx.ellipse(headX + 5.5 * s, headY - 7 * s, 1.1 * s, 1.1 * s, 0, 0, Math.PI * 2);
    bctx.fill();

    const mouthOpen = state.aiming;
    if (mouthOpen) {
      bctx.strokeStyle = theme.accent;
      bctx.lineWidth = 1;
      bctx.beginPath();
      bctx.arc(headX, headY + 3.8 * s, 5.5 * s, 0.1 * Math.PI, 0.9 * Math.PI);
      bctx.stroke();
      bctx.fillStyle = "#f97316";
      bctx.beginPath();
      bctx.ellipse(headX, headY + 4.6 * s, 3.0 * s, 1.4 * s, 0, 0, Math.PI * 2);
      bctx.fill();
      bctx.fillStyle = "#fda4af";
      bctx.beginPath();
      bctx.ellipse(headX, headY + 4.4 * s, 1.6 * s, 0.7 * s, 0, 0, Math.PI * 2);
      bctx.fill();
    }
  } else {
    if (facingBack) {
      bctx.fillStyle = stage >= 5 ? "rgba(100, 116, 139, 0.9)" : "rgba(202, 138, 4, 0.8)";
      bctx.beginPath();
      bctx.ellipse(headX - 3 * s, headY - 1 * s, 1.5 * s, 1.2 * s, 0, 0, Math.PI * 2);
      bctx.ellipse(headX + 2 * s, headY - 2 * s, 1.2 * s, 1.0 * s, 0, 0, Math.PI * 2);
      bctx.ellipse(x - 3 * s, y + 1 * s, 1.6 * s, 1.2 * s, 0, 0, Math.PI * 2);
      bctx.ellipse(x + 4 * s, y, 1.4 * s, 1.1 * s, 0, 0, Math.PI * 2);
      bctx.fill();
      bctx.strokeStyle = stage >= 5 ? "rgba(15, 23, 42, 0.7)" : "rgba(161, 98, 7, 0.7)";
      bctx.beginPath();
      bctx.moveTo(headX - 3 * s, headY - 5 * s);
      bctx.lineTo(headX - 1 * s, headY - 7 * s);
      bctx.moveTo(headX + 3 * s, headY - 5 * s);
      bctx.lineTo(headX + 1 * s, headY - 7 * s);
      bctx.stroke();
      return;
    }

    const eyeOffX = dx * 2.5;
    const eyeOffY = dy * 2.5;
    bctx.fillStyle = theme.leg;
    bctx.beginPath();
    bctx.ellipse(headX - 4 * s, headY - 5 * s, 3.2 * s, 3.2 * s, 0, 0, Math.PI * 2);
    bctx.ellipse(headX + 4 * s, headY - 5 * s, 3.2 * s, 3.2 * s, 0, 0, Math.PI * 2);
    bctx.fill();
    bctx.fillStyle = "#f8fafc";
    bctx.beginPath();
    bctx.ellipse(headX - 4 * s + eyeOffX, headY - 5 * s + eyeOffY, 2.2 * s, 2.2 * s, 0, 0, Math.PI * 2);
    bctx.ellipse(headX + 4 * s + eyeOffX, headY - 5 * s + eyeOffY, 2.2 * s, 2.2 * s, 0, 0, Math.PI * 2);
    bctx.fill();
    bctx.fillStyle = "#0f172a";
    bctx.beginPath();
    bctx.ellipse(headX - 4 * s + eyeOffX, headY - 5 * s + eyeOffY, 0.9 * s, 0.9 * s, 0, 0, Math.PI * 2);
    bctx.ellipse(headX + 4 * s + eyeOffX, headY - 5 * s + eyeOffY, 0.9 * s, 0.9 * s, 0, 0, Math.PI * 2);
    bctx.fill();

    const mouthOpen = state.aiming;
    if (mouthOpen) {
      const mx = headX + dx * 2;
      const my = headY + dy * 3;
      bctx.strokeStyle = theme.accent;
      bctx.beginPath();
      bctx.moveTo(mx - 3 * s, my);
      bctx.lineTo(mx + 3 * s, my);
      bctx.stroke();
      bctx.fillStyle = "#f97316";
      bctx.beginPath();
      bctx.ellipse(mx, my + 0.6 * s, 2.2 * s, 1.0 * s, 0, 0, Math.PI * 2);
      bctx.fill();
      bctx.fillStyle = "#fda4af";
      bctx.beginPath();
      bctx.ellipse(mx, my + 0.4 * s, 1.1 * s, 0.5 * s, 0, 0, Math.PI * 2);
      bctx.fill();
    }
  }

  if (stage >= 5) {
    bctx.strokeStyle = "rgba(148, 163, 184, 0.9)";
    bctx.beginPath();
    bctx.moveTo(x - 6 * s, y);
    bctx.lineTo(x + 6 * s, y);
    bctx.stroke();
    bctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    bctx.fillRect(x - 2 * s, y - 3 * s, 4 * s, 2 * s);
  }
}

function drawTongueBack(bctx) {
  if (!state.aiming) return;
  const frog = state.frog;
  const dx = state.aim.x - frog.x;
  const dy = state.aim.y - frog.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return;
  const ux = dx / dist;
  const uy = dy / dist;
  const hold = Math.min(
    CHARGE_MAX,
    (performance.now() - state.chargeStart) / 600
  );
  const chargeAmount = Math.min(1, hold / CHARGE_MAX);
  const aimDist = Math.max(4, dist);
  const maxBack = Math.max(12, Math.min(aimDist * state.stats.tongueReach, 75));
  const back = Math.max(12, maxBack * (0.3 + chargeAmount * 0.7));
  const ax = frog.x - ux * back;
  const ay = frog.y - uy * back;
  const fpos = worldToScreen(frog.x, frog.y);
  const apos = worldToScreen(ax, ay);

  // tongue-style aim indicator
  const mouth = getFrogMouthScreenPos();
  const midX = (mouth.x + apos.x) / 2;
  const midY = (mouth.y + apos.y) / 2;

  bctx.strokeStyle = "#fb7185";
  bctx.lineWidth = 4;
  bctx.lineCap = "round";
  bctx.beginPath();
  bctx.moveTo(mouth.x, mouth.y);
  bctx.quadraticCurveTo(midX, midY, apos.x, apos.y);
  bctx.stroke();

  bctx.strokeStyle = "#fda4af";
  bctx.lineWidth = 2;
  bctx.beginPath();
  bctx.moveTo(mouth.x, mouth.y);
  bctx.quadraticCurveTo(midX, midY, apos.x, apos.y);
  bctx.stroke();
}

function drawTongueTip(bctx) {
  if (!state.aiming) return;
  const frog = state.frog;
  const dx = state.aim.x - frog.x;
  const dy = state.aim.y - frog.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return;
  const ux = dx / dist;
  const uy = dy / dist;
  const hold = Math.min(
    CHARGE_MAX,
    (performance.now() - state.chargeStart) / 600
  );
  const chargeAmount = Math.min(1, hold / CHARGE_MAX);
  const aimDist = Math.max(4, dist);
  const maxBack = Math.max(12, Math.min(aimDist * state.stats.tongueReach, 75));
  const back = Math.max(12, maxBack * (0.3 + chargeAmount * 0.7));
  const ax = frog.x - ux * back;
  const ay = frog.y - uy * back;
  const apos = worldToScreen(ax, ay);

  bctx.fillStyle = "#fb7185";
  bctx.beginPath();
  bctx.ellipse(apos.x, apos.y, 4.5, 3.2, 0, 0, Math.PI * 2);
  bctx.fill();
  bctx.fillStyle = "#fda4af";
  bctx.beginPath();
  bctx.ellipse(apos.x + 1, apos.y, 2.2, 1.6, 0, 0, Math.PI * 2);
  bctx.fill();
}

function getFrogMouthScreenPos() {
  const frog = state.frog;
  const speed = Math.hypot(frog.vx, frog.vy);
  let faceAngle = frog.faceAngle;
  if (state.aiming) {
    faceAngle = Math.atan2(frog.y - state.aim.y, frog.x - state.aim.x);
  } else if (speed < 0.05) {
    faceAngle = -Math.PI / 2;
  }
  const dirIndex =
    ((Math.round((faceAngle / (Math.PI * 2)) * 12) % 12) + 12) % 12;
  const dirAngle = (dirIndex / 12) * Math.PI * 2;
  const dx = Math.cos(dirAngle);
  const dy = Math.sin(dirAngle);
  const pos = worldToScreen(frog.x, frog.y + frog.bob);
  // mouth sits slightly forward on the head
  return {
    x: pos.x + dx * 7,
    y: pos.y + dy * 7 - 2,
  };
}

function drawChargeUI(bctx) {
  if (!state.aiming) return;
  const hold = Math.min(
    CHARGE_MAX,
    (performance.now() - state.chargeStart) / 600
  );
  const w = 52;
  const h = 6;
  const x = VIRTUAL_W - w - 8;
  const y = 8;
  bctx.fillStyle = "rgba(15,23,42,0.6)";
  bctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  bctx.fillStyle = "#fef3c7";
  bctx.fillRect(x, y, w * (hold / CHARGE_MAX), h);
  bctx.strokeStyle = "#f59e0b";
  bctx.strokeRect(x, y, w, h);
}

export function drawHud(bctx) {
  const energy = state.frog.energy;
  const maxEnergy = state.frog.maxEnergy;
  const w = 60;
  const h = 6;
  const x = 8;
  const y = 8;
  bctx.fillStyle = "rgba(15,23,42,0.6)";
  bctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  bctx.fillStyle = "#22c55e";
  bctx.fillRect(x, y, w * (energy / maxEnergy), h);
  bctx.strokeStyle = "rgba(148,163,184,0.6)";
  bctx.strokeRect(x, y, w, h);
  bctx.fillStyle = "#e2e8f0";
  bctx.font = "8px Microsoft YaHei UI";
  bctx.fillText(`Energy ${Math.round(energy)}`, x, y + 16);
  bctx.fillText(`Score ${state.score}`, x, y + 26);
  bctx.fillText(`Stage ${state.stage}`, x, y + 36);

  // evolution bar
  const stage = state.stage;
  const cur = state.stageScore[stage - 1] ?? 0;
  const next = state.stageScore[stage] ?? (cur + 100);
  const prog = Math.min(1, (state.score - cur) / Math.max(1, next - cur));
  const bx = 8;
  const by = VIRTUAL_H - 10;
  const bw = 80;
  const bh = 4;
  bctx.fillStyle = "rgba(15,23,42,0.6)";
  bctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
  bctx.fillStyle = "#f59e0b";
  bctx.fillRect(bx, by, bw * prog, bh);
  bctx.strokeStyle = "rgba(148,163,184,0.6)";
  bctx.strokeRect(bx, by, bw, bh);
  bctx.fillStyle = "#e2e8f0";
  bctx.fillText("Evo", bx + bw + 6, by + 4);
}

function drawHurtFlash(bctx) {
  if (state.hurtFlash <= 0) return;
  bctx.fillStyle = `rgba(239, 68, 68, ${0.18 * state.hurtFlash})`;
  bctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);
}
