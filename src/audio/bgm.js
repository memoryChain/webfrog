import { state } from "../core/state.js";

let ctx;
let gain;
let isOn = false;

const melody = [
  ["C5", 0.4], ["E5", 0.4], ["G5", 0.8],
  ["A5", 0.4], ["G5", 0.4], ["E5", 0.8],
  ["D5", 0.4], ["F5", 0.4], ["A5", 0.8],
  ["G5", 0.4], ["E5", 0.4], ["C5", 0.8],
  ["B4", 0.4], ["D5", 0.4], ["G5", 0.8],
  ["E5", 0.4], ["D5", 0.4], ["C5", 0.8],
  ["A4", 0.4], ["C5", 0.4], ["E5", 0.8],
  ["D5", 0.4], ["C5", 0.4], ["B4", 0.8],
];

const bass = [
  ["C3", 0.8], ["G2", 0.8],
  ["A2", 0.8], ["E2", 0.8],
  ["F2", 0.8], ["C2", 0.8],
  ["G2", 0.8], ["D2", 0.8],
  ["E2", 0.8], ["B1", 0.8],
  ["C2", 0.8], ["G1", 0.8],
  ["A1", 0.8], ["E1", 0.8],
  ["F1", 0.8], ["C1", 0.8],
];

function noteToFreq(note) {
  const map = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const n = note[0];
  const octave = parseInt(note.slice(1), 10);
  const semitone = map[n] + (octave - 4) * 12;
  return 261.63 * Math.pow(2, semitone / 12);
}

function shiftNote(note, offset) {
  const name = note.slice(0, 1);
  const octave = parseInt(note.slice(1), 10);
  return `${name}${octave + offset}`;
}

function playSequence(startTime, seq, type, vol, tempo = 1, detune = 0) {
  let t = startTime;
  seq.forEach(([note, len]) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = noteToFreq(note);
    osc.detune.value = detune;
    g.gain.value = vol;
    osc.connect(g);
    g.connect(gain);
    osc.start(t);
    osc.stop(t + len / tempo);
    t += len / tempo;
  });
  return t;
}

function playKick(startTime, beats, tempo, vol) {
  const beatLen = 1.6 / tempo;
  for (let i = 0; i < beats; i++) {
    const t = startTime + i * beatLen;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(g);
    g.connect(gain);
    osc.start(t);
    osc.stop(t + 0.22);
  }
}

function playHat(startTime, beats, tempo, vol) {
  const beatLen = 0.8 / tempo;
  for (let i = 0; i < beats; i++) {
    const t = startTime + i * beatLen;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1800, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.connect(g);
    g.connect(gain);
    osc.start(t);
    osc.stop(t + 0.1);
  }
}

function loopMusic() {
  const now = ctx.currentTime + 0.05;
  const stage = Math.max(1, Math.min(6, state.stage || 1));
  const tempo = 0.78 + stage * 0.12;
  const vol = 0.045 + stage * 0.008;
  const bassVol = 0.03 + stage * 0.007;
  const melodyType = stage <= 3 ? "sine" : "triangle";
  const bassType = stage <= 4 ? "triangle" : "square";
  const melodicShift = stage >= 5 ? 1 : 0;

  const stageMelody = melodicShift
    ? melody.map(([note, len]) => [shiftNote(note, melodicShift), len])
    : melody;
  const end1 = playSequence(now, stageMelody, melodyType, vol, tempo);
  const end2 = playSequence(now, bass, bassType, bassVol, tempo, -4);
  if (stage >= 3) {
    const bright = melody.map(([note, len]) => [shiftNote(note, 1), len]);
    playSequence(now + 0.25, bright, "triangle", vol * 0.25, tempo, 4);
  }
  if (stage >= 5) {
    playKick(now, 6, tempo, 0.06 + stage * 0.006);
  }
  if (stage >= 6) {
    playHat(now, 10, tempo, 0.02 + stage * 0.003);
  }
  const end = Math.max(end1, end2);
  setTimeout(loopMusic, Math.max(200, (end - ctx.currentTime) * 1000 - 50));
}

export function setupBgm() {
  const button = document.createElement("button");
  button.textContent = "BGM: Off";
  button.style.position = "fixed";
  button.style.right = "16px";
  button.style.bottom = "16px";
  button.style.zIndex = "5";
  button.style.padding = "8px 12px";
  button.style.borderRadius = "999px";
  button.style.border = "1px solid rgba(255,255,255,0.25)";
  button.style.background = "rgba(15,23,42,0.6)";
  button.style.color = "#e2e8f0";
  button.style.cursor = "pointer";
  document.body.appendChild(button);

  button.addEventListener("click", async () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gain = ctx.createGain();
      gain.gain.value = 0.4;
      gain.connect(ctx.destination);
    }
    if (!isOn) {
      await ctx.resume();
      isOn = true;
      button.textContent = "BGM: On";
      loopMusic();
    } else {
      isOn = false;
      button.textContent = "BGM: Off";
      if (ctx && ctx.state === "running") {
        ctx.suspend();
      }
    }
  });
}
