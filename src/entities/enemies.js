import { state } from "../core/state.js";
import { worldToScreen } from "../core/camera.js";
import { addPopup } from "../ui/popups.js";

const enemies = [];
const bullets = [];
const hazards = [];

const ENEMY_TYPES = [
  { id: "jelly", tier: 1, behavior: "drift", color: "rgba(244,114,182,0.9)", size: 1.0 },
  { id: "whirl", tier: 1, behavior: "orbit", color: "rgba(56,189,248,0.9)", size: 1.0 },
  { id: "piranha", tier: 2, behavior: "dash", color: "rgba(251,146,60,0.9)", size: 1.1 },
  { id: "shock", tier: 2, behavior: "teleport", color: "rgba(167,139,250,0.9)", size: 1.1 },
  { id: "spike", tier: 3, behavior: "zigzag", color: "rgba(251,113,133,0.9)", size: 1.0 },
  { id: "leech", tier: 3, behavior: "leech", color: "rgba(34,197,94,0.9)", size: 1.0 },
  { id: "crab", tier: 3, behavior: "strafe", color: "rgba(248,113,113,0.9)", size: 1.2 },
  { id: "moth", tier: 4, behavior: "sine", color: "rgba(163,230,53,0.9)", size: 1.0 },
  { id: "slime", tier: 4, behavior: "bounce", color: "rgba(96,165,250,0.9)", size: 1.1 },
  { id: "ghost", tier: 4, behavior: "hover", color: "rgba(148,163,184,0.9)", size: 1.0 },
  { id: "urchin", tier: 4, behavior: "spiral", color: "rgba(236,72,153,0.9)", size: 1.2 },
  { id: "blade", tier: 5, behavior: "dart", color: "rgba(14,165,233,0.9)", size: 1.0 },
  { id: "drone", tier: 5, behavior: "sweep", color: "rgba(148,163,184,0.9)", size: 1.1 },
  { id: "koi", tier: 5, behavior: "glide", color: "rgba(249,115,22,0.9)", size: 1.3 },
  { id: "manta", tier: 5, behavior: "wave", color: "rgba(59,130,246,0.9)", size: 1.6 },
  { id: "beetle", tier: 6, behavior: "ram", color: "rgba(250,204,21,0.9)", size: 1.2 },
  { id: "seed", tier: 6, behavior: "pulse", color: "rgba(132,204,22,0.9)", size: 0.9 },
  { id: "sparker", tier: 6, behavior: "blink", color: "rgba(196,181,253,0.9)", size: 1.0 },
  { id: "thorn", tier: 6, behavior: "orbit_fast", color: "rgba(244,63,94,0.9)", size: 1.0 },
  { id: "wyrm", tier: 6, behavior: "coil", color: "rgba(2,132,199,0.9)", size: 1.3 },
  { id: "shark", tier: 5, behavior: "ram", color: "rgba(30,64,175,0.9)", size: 2.0 },
];

function getType(id) {
  return ENEMY_TYPES.find((t) => t.id === id);
}

function getEnemyPool(stage) {
  const maxTier = Math.min(stage, 6);
  const types = ENEMY_TYPES.filter((t) => t.tier <= maxTier);
  const weights = types.map((t) => {
    const tierBias = t.tier / maxTier;
    const stageBoost = 0.12 * stage;
    return 1 + tierBias * (1 + stageBoost);
  });
  return { types, weights };
}

function pickWeighted(types, weights) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < types.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return types[i];
  }
  return types[types.length - 1];
}

export function spawnEnemyNear(x, y, forceType = null) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 60 + Math.random() * 90;
  const stage = state.stage;
  const pool = getEnemyPool(stage);
  const type = forceType ? getType(forceType) : pickWeighted(pool.types, pool.weights);
  if (!type) return;
  enemies.push({
    x: x + Math.cos(angle) * radius,
    y: y + Math.sin(angle) * radius,
    r: 6 * (type.size || 1),
    type: type.id,
    tier: type.tier,
    behavior: type.behavior,
    phase: Math.random() * Math.PI * 2,
    frame: 0,
    frameTimer: 0,
    size: type.size || 1,
    skillTimer: 2 + Math.random() * 3,
    skillTime: 0,
    skillHit: false,
    skillType: Math.random() < 0.5 ? "burst" : "dash",
  });
}

export function updateEnemies(dt) {
  const frog = state.frog;
  enemies.forEach((e) => {
    const prevX = e.x;
    const prevY = e.y;
    e.frameTimer += dt;
    if (e.frameTimer > 0.18) {
      e.frame = (e.frame + 1) % 3;
      e.frameTimer = 0;
    }
    e.phase += dt * 2.2;
    e.skillTimer -= dt;
    if (e.skillTimer <= 0) {
      e.skillTime = 0.7;
      e.skillHit = false;
      e.skillTimer = 3 + Math.random() * 3;
      if (e.type === "sparker" || e.type === "blade" || e.type === "shark") {
        const dxs = frog.x - e.x;
        const dys = frog.y - e.y;
        const ds = Math.max(1, Math.hypot(dxs, dys));
        const vx = (dxs / ds) * (e.type === "shark" ? 1.2 : 0.9);
        const vy = (dys / ds) * (e.type === "shark" ? 1.2 : 0.9);
        bullets.push({
          x: e.x,
          y: e.y,
          vx,
          vy,
          life: 2.0,
          r: e.type === "shark" ? 3.5 : 2.5,
          dmg: e.type === "shark" ? 14 : 10,
          color: e.type === "sparker" ? "rgba(196,181,253,0.9)" : "rgba(59,130,246,0.9)",
        });
      }
      if (e.type === "ghost" || e.type === "manta") {
        hazards.push({
          x: e.x,
          y: e.y,
          r: e.type === "manta" ? 18 : 14,
          life: 2.0,
          slow: e.type === "manta" ? 0.55 : 0.7,
          color: e.type === "manta" ? "rgba(59,130,246,0.25)" : "rgba(148,163,184,0.25)",
        });
      }
      if (e.type === "spike" || e.type === "urchin") {
        hazards.push({
          x: e.x,
          y: e.y,
          r: e.type === "urchin" ? 16 : 12,
          life: 1.2,
          explode: true,
          color: "rgba(248,113,113,0.25)",
        });
      }
    }
    const dx = frog.x - e.x;
    const dy = frog.y - e.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / dist;
    const uy = dy / dist;
    const awayX = -ux;
    const awayY = -uy;
    const edible = state.stage > e.tier;
    const flee = edible && dist < 180;
    const tx = flee ? awayX : ux;
    const ty = flee ? awayY : uy;

    switch (e.behavior) {
      case "drift":
        e.x += Math.sin(e.phase) * 0.5 + (flee ? awayX * 0.4 : 0);
        e.y += Math.cos(e.phase * 0.7) * 0.5 + (flee ? awayY * 0.4 : 0);
        break;
      case "orbit":
        e.x += tx * 0.2 + (-ty) * Math.sin(e.phase) * 0.5;
        e.y += ty * 0.2 + (tx) * Math.sin(e.phase) * 0.5;
        if (flee) {
          e.x += awayX * 0.4;
          e.y += awayY * 0.4;
        }
        break;
      case "dash":
        {
          const dash = Math.sin(e.phase) > 0.7 ? 1.1 : 0.35;
          e.x += tx * dash;
          e.y += ty * dash;
        }
        break;
      case "teleport":
        e.x += Math.sin(e.phase * 1.7) * 0.9;
        e.y += Math.cos(e.phase * 1.2) * 0.9;
        if (Math.sin(e.phase) > 0.95) {
          e.x += (Math.random() - 0.5) * 18;
          e.y += (Math.random() - 0.5) * 18;
        }
        if (flee) {
          e.x += awayX * 0.5;
          e.y += awayY * 0.5;
        }
        break;
      case "zigzag":
        e.x += tx * 0.28 + Math.sin(e.phase * 2.2) * 0.5;
        e.y += ty * 0.28 - Math.sin(e.phase * 2.2) * 0.5;
        break;
      case "leech":
        {
          const pull = Math.sin(e.phase) > 0.4 ? 0.6 : 0.2;
          e.x += tx * pull;
          e.y += ty * pull;
        }
        break;
      case "strafe":
        e.x += tx * 0.2 + Math.sin(e.phase) * 0.7;
        e.y += ty * 0.2;
        break;
      case "sine":
        e.x += tx * 0.25;
        e.y += ty * 0.25 + Math.sin(e.phase * 1.4) * 0.8;
        break;
      case "bounce":
        e.x += tx * 0.2 + Math.cos(e.phase) * 0.6;
        e.y += ty * 0.2 + Math.sin(e.phase) * 0.6;
        break;
      case "hover":
        e.x += Math.sin(e.phase) * 0.4 + (flee ? awayX * 0.5 : 0);
        e.y += Math.cos(e.phase) * 0.4 + (flee ? awayY * 0.5 : 0);
        break;
      case "spiral":
        e.x += tx * 0.15 + Math.cos(e.phase) * 0.7;
        e.y += ty * 0.15 + Math.sin(e.phase) * 0.7;
        break;
      case "dart":
        {
          const boost = e.skillTime > 0 ? 1.4 : 0.75;
          e.x += tx * boost;
          e.y += ty * boost;
        }
        break;
      case "sweep":
        {
          const sweep = e.skillTime > 0 ? 1.6 : 1.0;
          e.x += tx * 0.2 + Math.sin(e.phase * 0.8) * sweep;
          e.y += ty * 0.2 + Math.cos(e.phase * 0.8) * 0.2;
        }
        break;
      case "glide":
        e.x += tx * (e.skillTime > 0 ? 0.6 : 0.35);
        e.y += ty * (e.skillTime > 0 ? 0.6 : 0.35);
        break;
      case "wave":
        e.x += tx * 0.2 + Math.sin(e.phase) * 0.9;
        e.y += ty * 0.2;
        break;
      case "ram":
        {
          const boost = Math.sin(e.phase * 1.2) > 0.8 ? 1.6 : 0.45;
          const skillBoost = e.skillTime > 0 ? 1.8 : 1.0;
          e.x += tx * boost * skillBoost;
          e.y += ty * boost * skillBoost;
        }
        break;
      case "pulse":
        e.x += tx * 0.2 + Math.sin(e.phase) * 0.3;
        e.y += ty * 0.2 + Math.cos(e.phase) * 0.3;
        break;
      case "blink":
        if (Math.sin(e.phase) > 0.85) {
          e.x += (Math.random() - 0.5) * 16;
          e.y += (Math.random() - 0.5) * 16;
        }
        e.x += tx * (e.skillTime > 0 ? 0.5 : 0.2);
        e.y += ty * (e.skillTime > 0 ? 0.5 : 0.2);
        break;
      case "orbit_fast":
        e.x += tx * 0.2 + (-ty) * Math.sin(e.phase * 1.6) * 0.9;
        e.y += ty * 0.2 + (tx) * Math.sin(e.phase * 1.6) * 0.9;
        break;
      case "coil":
        e.x += tx * 0.25 + Math.sin(e.phase * 1.3) * 0.6;
        e.y += ty * 0.25 + Math.cos(e.phase * 1.3) * 0.6;
        break;
      default:
        e.x += tx * 0.2;
        e.y += ty * 0.2;
    }

    if (e.skillTime > 0) {
      e.skillTime -= dt;
    }
    const mvx = e.x - prevX;
    const mvy = e.y - prevY;
    if (Math.hypot(mvx, mvy) > 0.01) {
      e.angle = Math.atan2(mvy, mvx);
    }
  });

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    const dist = Math.hypot(e.x - frog.x, e.y - frog.y);
    if (dist > 320) {
      enemies.splice(i, 1);
      continue;
    }
    if (dist < e.r + 6) {
      if (state.stage > e.tier) {
        frog.energy = Math.min(frog.maxEnergy, frog.energy + 10);
        const gain = 12 * e.tier;
        state.score += gain;
        addPopup(`+${gain}`, frog.x, frog.y - 8, "#facc15");
        enemies.splice(i, 1);
      } else {
        const dmg = 10 + e.tier * 4;
        frog.energy = Math.max(0, frog.energy - dmg);
        state.hurtFlash = Math.min(1, state.hurtFlash + 0.7);
        addPopup(`-${dmg}`, frog.x, frog.y - 8, "#fb7185");
        enemies.splice(i, 1);
      }
    }
    if (e.skillTime > 0 && !e.skillHit && dist < e.r + 14) {
      const extra = 6 + e.tier * 2;
      frog.energy = Math.max(0, frog.energy - extra);
      state.hurtFlash = Math.min(1, state.hurtFlash + 0.5);
      addPopup(`-${extra}`, frog.x, frog.y - 12, "#f43f5e");
      e.skillHit = true;
    }
  }

  // bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * 2.2;
    b.y += b.vy * 2.2;
    b.life -= dt;
    if (b.life <= 0) {
      bullets.splice(i, 1);
      continue;
    }
    const dist = Math.hypot(b.x - frog.x, b.y - frog.y);
    if (dist < b.r + 6) {
      frog.energy = Math.max(0, frog.energy - b.dmg);
      state.hurtFlash = Math.min(1, state.hurtFlash + 0.6);
      addPopup(`-${b.dmg}`, frog.x, frog.y - 12, "#f43f5e");
      bullets.splice(i, 1);
    }
  }

  // hazards
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i];
    h.life -= dt;
    if (h.life <= 0) {
      hazards.splice(i, 1);
      continue;
    }
    const dist = Math.hypot(h.x - frog.x, h.y - frog.y);
    if (dist < h.r + 4) {
      if (h.slow) {
        frog.vx *= h.slow;
        frog.vy *= h.slow;
      }
      if (h.explode && !h.hit) {
        h.hit = true;
        const dmg = 10;
        frog.energy = Math.max(0, frog.energy - dmg);
        state.hurtFlash = Math.min(1, state.hurtFlash + 0.6);
        addPopup(`-${dmg}`, frog.x, frog.y - 12, "#f43f5e");
      }
    }
  }
}

export function drawEnemies(bctx) {
  const drawEye = (x, y, scale) => {
    bctx.fillStyle = "#0f172a";
    bctx.beginPath();
    bctx.ellipse(x, y, 1.1 * scale, 1.1 * scale, 0, 0, Math.PI * 2);
    bctx.fill();
    bctx.fillStyle = "rgba(255,255,255,0.9)";
    bctx.beginPath();
    bctx.ellipse(x + 0.4 * scale, y - 0.4 * scale, 0.5 * scale, 0.5 * scale, 0, 0, Math.PI * 2);
    bctx.fill();
  };
  const drawIntent = (pos, angle, color, scale) => {
    bctx.save();
    bctx.translate(pos.x, pos.y);
    bctx.rotate(angle);
    bctx.fillStyle = color;
    bctx.beginPath();
    bctx.moveTo(8 * scale, 0);
    bctx.lineTo(5 * scale, -2.8 * scale);
    bctx.lineTo(5 * scale, 2.8 * scale);
    bctx.closePath();
    bctx.fill();
    bctx.restore();
  };
  const drawDot = (pos, color, scale) => {
    bctx.fillStyle = color;
    bctx.beginPath();
    bctx.ellipse(pos.x, pos.y - 8 * scale, 1.9 * scale, 1.9 * scale, 0, 0, Math.PI * 2);
    bctx.fill();
  };

  enemies.forEach((e) => {
    const pos = worldToScreen(e.x, e.y);
    const frame = e.frame || 0;
    const s = e.size || 1;
    const angle = e.angle || 0;
    const frog = state.frog;
    const dx = frog.x - e.x;
    const dy = frog.y - e.y;
    const dist = Math.hypot(dx, dy);
    const edible = state.stage > e.tier;
    const fleeing = edible && dist < 180;
    if (e.skillTime > 0) {
      bctx.strokeStyle = "rgba(251, 191, 36, 0.7)";
      bctx.beginPath();
      bctx.ellipse(pos.x, pos.y, (e.r + 6) * s, (e.r + 3) * s, 0, 0, Math.PI * 2);
      bctx.stroke();
    }
    const intentAlpha = Math.max(0, Math.min(1, 1 - (dist - 60) / 180));
    if (intentAlpha > 0.08) {
      const ringColor = edible ? "rgba(34,197,94," : "rgba(239,68,68,";
      bctx.strokeStyle = `${ringColor}${0.18 * intentAlpha})`;
      bctx.lineWidth = 1;
      bctx.beginPath();
      bctx.ellipse(pos.x, pos.y, (e.r + 2.5) * s, (e.r + 1.6) * s, 0, 0, Math.PI * 2);
      bctx.stroke();
      bctx.lineWidth = 1;
    }
    bctx.save();
    bctx.translate(pos.x, pos.y);
    if (Math.cos(angle) < 0) {
      bctx.scale(-1, 1);
    }
    const x = 0;
    const y = 0;
    switch (e.type) {
      case "jelly":
        bctx.fillStyle = "rgba(244, 114, 182, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y - 1 * s, 6.5 * s, 5.5 * s, 0, Math.PI, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(253, 164, 175, 0.8)";
        bctx.fillRect(x - 4 * s, y + 2 * s, 1.4 * s, (5 + frame) * s);
        bctx.fillRect(x - 1 * s, y + 2 * s, 1.4 * s, (6 + frame) * s);
        bctx.fillRect(x + 2 * s, y + 2 * s, 1.4 * s, (5 + frame) * s);
        drawEye(x - 2 * s, y - 1.5 * s, 0.9 * s);
        drawEye(x + 2 * s, y - 1.5 * s, 0.9 * s);
        break;
      case "whirl":
        bctx.fillStyle = "rgba(56, 189, 248, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 7.5 * s, 5.2 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(125, 211, 252, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 4.5 * s, 3.2 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(14, 165, 233, 0.9)";
        bctx.fillRect(x - 7 * s, y - 1 * s, 2 * s, 2 * s);
        bctx.fillRect(x + 5 * s, y - 1 * s, 2 * s, 2 * s);
        bctx.fillRect(x - 2 * s, y + 4 * s, 4 * s, 2 * s);
        drawEye(x - 1.5 * s, y - 1 * s, 0.9 * s);
        drawEye(x + 2.5 * s, y - 1 * s, 0.9 * s);
        break;
      case "piranha":
        bctx.fillStyle = "rgba(251, 146, 60, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 6.5 * s, (frame === 1 ? 4.5 : 4.0) * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(234, 88, 12, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x - 6 * s, y);
        bctx.lineTo(x - 10 * s, y - (frame === 2 ? 4 : 3) * s);
        bctx.lineTo(x - 10 * s, y + (frame === 2 ? 4 : 3) * s);
        bctx.closePath();
        bctx.fill();
        bctx.fillStyle = "rgba(251, 191, 36, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x + 3 * s, y - 2 * s);
        bctx.lineTo(x + 6 * s, y);
        bctx.lineTo(x + 3 * s, y + 2 * s);
        bctx.closePath();
        bctx.fill();
        drawEye(x + 1.5 * s, y - 1 * s, 0.9 * s);
        break;
      case "shock":
        bctx.fillStyle = "rgba(167, 139, 250, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 8.5 * s, 3.6 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(196, 181, 253, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x - 6 * s, y);
        bctx.lineTo(x - 10 * s, y - 2 * s);
        bctx.lineTo(x - 10 * s, y + 2 * s);
        bctx.closePath();
        bctx.fill();
        bctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x - 1 * s, y - 2 * s);
        bctx.lineTo(x + 1 * s, y - 3 * s);
        bctx.lineTo(x + 3 * s, y - 1 * s);
        bctx.lineTo(x + 1 * s, y);
        bctx.stroke();
        drawEye(x + 3 * s, y - 1 * s, 0.8 * s);
        break;
      case "spike":
        bctx.fillStyle = "rgba(251, 113, 133, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 5.8 * s, 5.8 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.strokeStyle = "rgba(253, 164, 175, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x - 7 * s, y);
        bctx.lineTo(x - 10 * s, y);
        bctx.moveTo(x + 7 * s, y);
        bctx.lineTo(x + 10 * s, y);
        bctx.moveTo(x, y - 7 * s);
        bctx.lineTo(x, y - 10 * s);
        bctx.moveTo(x, y + 7 * s);
        bctx.lineTo(x, y + 10 * s);
        bctx.stroke();
        drawEye(x - 2 * s, y - 1 * s, 0.7 * s);
        drawEye(x + 2 * s, y - 1 * s, 0.7 * s);
        break;
      case "leech":
        bctx.fillStyle = "rgba(34, 197, 94, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 7.5 * s, 3.2 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(22, 163, 74, 0.9)";
        bctx.fillRect(x - 4 * s, y - 2 * s, 1.2 * s, 4 * s);
        bctx.fillRect(x - 1 * s, y - 2.2 * s, 1.2 * s, 4.4 * s);
        bctx.fillRect(x + 2 * s, y - 2 * s, 1.2 * s, 4 * s);
        drawEye(x + 4.5 * s, y - 0.8 * s, 0.7 * s);
        break;
      case "crab":
        bctx.fillStyle = "rgba(248, 113, 113, 0.9)";
        bctx.fillRect(x - 5 * s, y - 2 * s, 10 * s, 4 * s);
        bctx.fillStyle = "rgba(248, 113, 113, 0.9)";
        bctx.fillRect(x - 9 * s, y - 2 * s, 3 * s, 3 * s);
        bctx.fillRect(x + 6 * s, y - 2 * s, 3 * s, 3 * s);
        drawEye(x - 2 * s, y - 1.5 * s, 0.7 * s);
        drawEye(x + 2 * s, y - 1.5 * s, 0.7 * s);
        break;
      case "moth":
        bctx.fillStyle = "rgba(163, 230, 53, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x - 4 * s, y, 4.5 * s, 3 * s, 0, 0, Math.PI * 2);
        bctx.ellipse(x + 4 * s, y, 4.5 * s, 3 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(132, 204, 22, 0.9)";
        bctx.fillRect(x - 1 * s, y - 3 * s, 2 * s, 6 * s);
        bctx.strokeStyle = "rgba(101, 163, 13, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x - 1 * s, y - 4 * s);
        bctx.lineTo(x - 3 * s, y - 6 * s);
        bctx.moveTo(x + 1 * s, y - 4 * s);
        bctx.lineTo(x + 3 * s, y - 6 * s);
        bctx.stroke();
        break;
      case "slime":
        bctx.fillStyle = "rgba(96, 165, 250, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 6 * s, 4 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(59, 130, 246, 0.9)";
        bctx.fillRect(x - 4 * s, y + 2 * s, 2 * s, 2 * s);
        bctx.fillRect(x + 1 * s, y + 2 * s, 2 * s, 2 * s);
        drawEye(x - 2 * s, y - 1 * s, 0.8 * s);
        drawEye(x + 2 * s, y - 1 * s, 0.8 * s);
        break;
      case "ghost":
        bctx.fillStyle = "rgba(148, 163, 184, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y - 1 * s, 6 * s, 4.8 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillRect(x - 6 * s, y, 12 * s, 4 * s);
        drawEye(x - 2 * s, y - 2 * s, 0.8 * s);
        drawEye(x + 2 * s, y - 2 * s, 0.8 * s);
        break;
      case "urchin":
        bctx.fillStyle = "rgba(236, 72, 153, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 5.8 * s, 5.2 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(244, 114, 182, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x - 2 * s, y - 4 * s);
        bctx.lineTo(x - 7 * s, y - 6 * s);
        bctx.lineTo(x - 3 * s, y - 1 * s);
        bctx.closePath();
        bctx.fill();
        drawEye(x - 1.5 * s, y - 0.8 * s, 0.7 * s);
        drawEye(x + 1.5 * s, y - 0.8 * s, 0.7 * s);
        break;
      case "blade":
        bctx.fillStyle = "rgba(14, 165, 233, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 6 * s, 3 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(56, 189, 248, 0.9)";
        bctx.fillRect(x + 4 * s, y - 1 * s, 6 * s, 2 * s);
        bctx.fillStyle = "rgba(2, 132, 199, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x - 6 * s, y);
        bctx.lineTo(x - 10 * s, y - 2 * s);
        bctx.lineTo(x - 10 * s, y + 2 * s);
        bctx.closePath();
        bctx.fill();
        drawEye(x + 1 * s, y - 1 * s, 0.8 * s);
        break;
      case "drone":
        bctx.fillStyle = "rgba(148, 163, 184, 0.9)";
        bctx.fillRect(x - 6 * s, y - 3 * s, 12 * s, 6 * s);
        bctx.fillStyle = "rgba(203, 213, 225, 0.9)";
        bctx.fillRect(x - 2 * s, y - 6 * s, 4 * s, 3 * s);
        bctx.fillStyle = "rgba(51, 65, 85, 0.9)";
        bctx.fillRect(x - 1 * s, y - 8 * s, 2 * s, 2 * s);
        drawEye(x + 3 * s, y - 1 * s, 0.7 * s);
        break;
      case "koi":
        bctx.fillStyle = "rgba(249, 115, 22, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 7 * s, 3.8 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(251, 191, 36, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x - 7 * s, y);
        bctx.lineTo(x - 11 * s, y - 3 * s);
        bctx.lineTo(x - 11 * s, y + 3 * s);
        bctx.closePath();
        bctx.fill();
        drawEye(x + 2 * s, y - 1 * s, 0.8 * s);
        break;
      case "manta":
        bctx.fillStyle = "rgba(59, 130, 246, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 8 * s, 3.6 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(37, 99, 235, 0.9)";
        bctx.fillRect(x - 1 * s, y + 3 * s, 2 * s, 5 * s);
        drawEye(x - 2 * s, y - 1 * s, 0.7 * s);
        drawEye(x + 2 * s, y - 1 * s, 0.7 * s);
        break;
      case "beetle":
        bctx.fillStyle = "rgba(250, 204, 21, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 5 * s, 4 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(234, 179, 8, 0.9)";
        bctx.fillRect(x - 1 * s, y - 4 * s, 2 * s, 8 * s);
        bctx.strokeStyle = "rgba(120, 53, 15, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x - 4 * s, y + 1 * s);
        bctx.lineTo(x - 7 * s, y + 3 * s);
        bctx.moveTo(x + 4 * s, y + 1 * s);
        bctx.lineTo(x + 7 * s, y + 3 * s);
        bctx.stroke();
        break;
      case "seed":
        bctx.fillStyle = "rgba(132, 204, 22, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y + 1 * s, 3.5 * s, 4.5 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.strokeStyle = "rgba(34, 197, 94, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x, y - 1 * s);
        bctx.lineTo(x, y - 6 * s);
        bctx.stroke();
        bctx.fillStyle = "rgba(34, 197, 94, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x - 2 * s, y - 5 * s, 2 * s, 1 * s, 0, 0, Math.PI * 2);
        bctx.ellipse(x + 2 * s, y - 5 * s, 2 * s, 1 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        break;
      case "sparker":
        bctx.fillStyle = "rgba(196, 181, 253, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 4 * s, 3 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(253, 224, 71, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x + 4 * s, y, 2 * s, 1.5 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        drawEye(x - 1 * s, y - 0.8 * s, 0.7 * s);
        break;
      case "thorn":
        bctx.fillStyle = "rgba(244, 63, 94, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x, y - 6 * s);
        bctx.lineTo(x + 5 * s, y - 2 * s);
        bctx.lineTo(x + 6 * s, y + 4 * s);
        bctx.lineTo(x, y + 6 * s);
        bctx.lineTo(x - 6 * s, y + 4 * s);
        bctx.lineTo(x - 5 * s, y - 2 * s);
        bctx.closePath();
        bctx.fill();
        drawEye(x - 2 * s, y - 1 * s, 0.7 * s);
        drawEye(x + 2 * s, y - 1 * s, 0.7 * s);
        break;
      case "wyrm":
        bctx.fillStyle = "rgba(2, 132, 199, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 8 * s, 3 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(14, 116, 144, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x - 6 * s, y, 4 * s, 2.2 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        drawEye(x + 4 * s, y - 0.8 * s, 0.8 * s);
        break;
      case "shark":
        bctx.fillStyle = "rgba(30, 64, 175, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 10 * s, 4.5 * s, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "rgba(148, 163, 184, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x + 2 * s, y - 3 * s);
        bctx.lineTo(x + 6 * s, y - 5 * s);
        bctx.lineTo(x + 4 * s, y - 1 * s);
        bctx.closePath();
        bctx.fill();
        bctx.fillStyle = "rgba(148, 163, 184, 0.9)";
        bctx.beginPath();
        bctx.moveTo(x - 10 * s, y);
        bctx.lineTo(x - 15 * s, y - 4 * s);
        bctx.lineTo(x - 15 * s, y + 4 * s);
        bctx.closePath();
        bctx.fill();
        drawEye(x + 3 * s, y - 1 * s, 0.9 * s);
        break;
      default:
        bctx.fillStyle = "rgba(148, 163, 184, 0.9)";
        bctx.beginPath();
        bctx.ellipse(x, y, 5, 4, 0, 0, Math.PI * 2);
        bctx.fill();
    }
    bctx.restore();

    const intentAngle = Math.atan2(dy, dx);
    if (edible) {
      if (fleeing) {
        drawIntent(pos, intentAngle + Math.PI, "rgba(14, 165, 233, 0.55)", s);
      } else {
        drawDot(pos, "rgba(34, 197, 94, 0.55)", s);
      }
    } else {
      drawIntent(pos, intentAngle, "rgba(239, 68, 68, 0.55)", s);
    }
  });

  bullets.forEach((b) => {
    const pos = worldToScreen(b.x, b.y);
    bctx.fillStyle = b.color;
    bctx.beginPath();
    bctx.ellipse(pos.x, pos.y, b.r, b.r, 0, 0, Math.PI * 2);
    bctx.fill();
  });

  hazards.forEach((h) => {
    const pos = worldToScreen(h.x, h.y);
    bctx.fillStyle = h.color;
    bctx.beginPath();
    bctx.ellipse(pos.x, pos.y, h.r, h.r, 0, 0, Math.PI * 2);
    bctx.fill();
    if (h.explode) {
      bctx.strokeStyle = "rgba(248,113,113,0.6)";
      bctx.beginPath();
      bctx.ellipse(pos.x, pos.y, h.r + 4, h.r + 2, 0, 0, Math.PI * 2);
      bctx.stroke();
    }
  });
}

export function ensureEnemies() {
  const cap = state.stage <= 2 ? 7 : state.stage <= 3 ? 9 : state.stage <= 4 ? 12 : state.stage <= 5 ? 14 : 16;
  if (enemies.length >= cap) return;
  const pool = getEnemyPool(state.stage).types;
  const missing = pool.find((t) => !enemies.some((e) => e.type === t.id));
  if (missing) {
    spawnEnemyNear(state.frog.x, state.frog.y, missing.id);
    return;
  }
  if (state.enemySpawnTimer > 1.0 && Math.random() < 0.1 + state.stage * 0.015) {
    spawnEnemyNear(state.frog.x, state.frog.y);
    state.enemySpawnTimer = 0;
  }
}
