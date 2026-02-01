import { state, resetState } from "../core/state.js";

let overlay;
let titleNode;

export function initGameOver() {
  overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.display = "none";
  overlay.style.background = "rgba(2, 6, 23, 0.75)";
  overlay.style.zIndex = "7";
  overlay.style.fontFamily = "Microsoft YaHei UI, sans-serif";

  const panel = document.createElement("div");
  panel.style.width = "520px";
  panel.style.maxWidth = "90vw";
  panel.style.margin = "18vh auto";
  panel.style.padding = "22px";
  panel.style.borderRadius = "16px";
  panel.style.background = "rgba(15, 23, 42, 0.95)";
  panel.style.border = "1px solid rgba(148,163,184,0.3)";
  panel.style.color = "#e2e8f0";
  overlay.appendChild(panel);

  titleNode = document.createElement("div");
  titleNode.textContent = "小青蛙精疲力尽了";
  titleNode.style.fontSize = "20px";
  titleNode.style.fontWeight = "700";
  titleNode.style.marginBottom = "12px";
  panel.appendChild(titleNode);

  const score = document.createElement("div");
  score.id = "gameover-score";
  score.style.marginBottom = "16px";
  panel.appendChild(score);

  const btn = document.createElement("button");
  btn.textContent = "再来一局";
  btn.style.padding = "10px 16px";
  btn.style.borderRadius = "10px";
  btn.style.border = "1px solid rgba(56,189,248,0.5)";
  btn.style.background = "rgba(30,41,59,0.8)";
  btn.style.color = "#e2e8f0";
  btn.style.cursor = "pointer";
  btn.onclick = () => {
    resetState();
    overlay.style.display = "none";
  };
  panel.appendChild(btn);

  document.body.appendChild(overlay);
}

export function updateGameOverUI() {
  if (!overlay) return;
  if (state.gameOver) {
    overlay.style.display = "block";
    const score = overlay.querySelector("#gameover-score");
    if (score) {
      score.textContent = `分数: ${state.score} · 距离: ${Math.round(state.distance)}`;
    }
  }
}
