import { state } from "../core/state.js";

const UPGRADE_POOL = [
  {
    id: "power",
    title: "弹力强化",
    desc: "跳跃力量 +12%",
    apply: () => {
      state.stats.powerMult *= 1.12;
    },
  },
  {
    id: "efficiency",
    title: "省力肌",
    desc: "每次跳跃消耗 -1",
    apply: () => {
      state.stats.energyCost = Math.max(2, state.stats.energyCost - 1);
    },
  },
  {
    id: "max_energy",
    title: "能量扩容",
    desc: "最大能量 +12",
    apply: () => {
      state.frog.maxEnergy += 12;
      state.frog.energy += 12;
    },
  },
  {
    id: "regen",
    title: "水面冥想",
    desc: "静止时能量恢复小幅提升",
    apply: () => {
      state.stats.regen += 0.2;
    },
  },
  {
    id: "tongue",
    title: "舌头加长",
    desc: "舌头长度 +15%",
    apply: () => {
      state.stats.tongueReach *= 1.15;
    },
  },
  {
    id: "regen2",
    title: "水面冥想+",
    desc: "静止时能量恢复再次提升",
    apply: () => {
      state.stats.regen += 0.25;
    },
  },
  {
    id: "power2",
    title: "弹弓硬核",
    desc: "跳跃力量 +20%",
    apply: () => {
      state.stats.powerMult *= 1.2;
    },
  },
  {
    id: "energy_saver",
    title: "省力肌+",
    desc: "每次跳跃消耗 -2",
    apply: () => {
      state.stats.energyCost = Math.max(1, state.stats.energyCost - 2);
    },
  },
  {
    id: "max_energy2",
    title: "能量扩容+",
    desc: "最大能量 +20",
    apply: () => {
      state.frog.maxEnergy += 20;
      state.frog.energy += 20;
    },
  },
  {
    id: "bubble_bonus",
    title: "泡泡偏爱",
    desc: "泡泡回复与分数小幅提升",
    apply: () => {
      state.stats.bubbleBonus = (state.stats.bubbleBonus || 1) + 0.15;
    },
  },
  {
    id: "bug_bonus",
    title: "虫虫盛宴",
    desc: "虫子回复与分数小幅提升",
    apply: () => {
      state.stats.bugBonus = (state.stats.bugBonus || 1) + 0.15;
    },
  },
];

export function getUpgradeChoices() {
  const pool = [...UPGRADE_POOL];
  const choices = [];
  while (choices.length < 3 && pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    choices.push(pool.splice(idx, 1)[0]);
  }
  return choices;
}
