import { VIRTUAL_W, VIRTUAL_H } from "./config.js";

export const state = {
  frog: {
    x: 160,
    y: 90,
    vx: 0,
    vy: 0,
    radius: 6,
    sizeScale: 1.0,
    bob: 0,
    cooldown: 0,
    jumpPhase: 0,
    faceAngle: -Math.PI / 2,
    energy: 100,
    maxEnergy: 100,
  },
  camera: { x: 160, y: 90, shake: 0, shakeX: 0, shakeY: 0, zoom: 1.0 },
  aiming: false,
  aim: { x: 0, y: 0 },
  charge: 0,
  chargeStart: 0,
  tongueRecoil: 0,
  ripples: [],
  time: 0,
  score: 0,
  distance: 0,
  lastDistanceCheck: 0,
  lastAimDist: 0,
  lastChargeAmount: 0,
  enemySpawnTimer: 0,
  pickupSpawnTimer: 0,
  paused: false,
  upgradePending: false,
  stats: {
    powerMult: 1.0,
    energyCost: 8,
    tongueReach: 1.0,
    regen: 0.15,
    bubbleBonus: 1.0,
    bugBonus: 1.0,
  },
  gameOver: false,
  stage: 1,
  stageScore: [0, 80, 200, 360, 560, 800],
  hurtFlash: 0,
};

export function resetState() {
  state.frog.x = VIRTUAL_W * 0.5;
  state.frog.y = VIRTUAL_H * 0.55;
  state.frog.vx = 0;
  state.frog.vy = 0;
  state.frog.jumpPhase = 0;
  state.frog.faceAngle = -Math.PI / 2;
  state.frog.energy = 100;
  state.frog.maxEnergy = 100;
  state.frog.sizeScale = 1.0;
  state.camera.x = state.frog.x;
  state.camera.y = state.frog.y;
  state.camera.zoom = 1.0;
  state.score = 0;
  state.distance = 0;
  state.lastDistanceCheck = 0;
  state.paused = false;
  state.upgradePending = false;
  state.stats = {
    powerMult: 1.0,
    energyCost: 8,
    tongueReach: 1.0,
    regen: 0.15,
    bubbleBonus: 1.0,
    bugBonus: 1.0,
  };
  state.gameOver = false;
  state.hurtFlash = 0;
  state.stage = 1;
  state.stageScore = [0, 80, 200, 360, 560, 800];
}
