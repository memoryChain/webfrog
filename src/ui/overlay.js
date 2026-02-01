import { state } from "../core/state.js";
import { getUpgradeChoices } from "../rogue/upgrades.js";

let overlay;
let choiceNodes = [];

export function initOverlay() {
  overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.display = "none";
  overlay.style.background = "rgba(2, 6, 23, 0.65)";
  overlay.style.zIndex = "6";
  overlay.style.fontFamily = "Microsoft YaHei UI, sans-serif";

  const panel = document.createElement("div");
  panel.style.width = "680px";
  panel.style.maxWidth = "90vw";
  panel.style.margin = "10vh auto";
  panel.style.padding = "20px";
  panel.style.borderRadius = "16px";
  panel.style.background = "rgba(15, 23, 42, 0.95)";
  panel.style.border = "1px solid rgba(148,163,184,0.3)";
  panel.style.color = "#e2e8f0";
  overlay.appendChild(panel);

  const title = document.createElement("div");
  title.textContent = "请选择一个强化";
  title.style.fontSize = "18px";
  title.style.fontWeight = "700";
  title.style.marginBottom = "12px";
  panel.appendChild(title);

  const list = document.createElement("div");
  list.style.display = "grid";
  list.style.gridTemplateColumns = "repeat(auto-fit, minmax(180px, 1fr))";
  list.style.gap = "12px";
  panel.appendChild(list);

  for (let i = 0; i < 3; i++) {
    const card = document.createElement("button");
    card.style.padding = "14px";
    card.style.borderRadius = "12px";
    card.style.border = "1px solid rgba(56, 189, 248, 0.4)";
    card.style.background = "rgba(30, 41, 59, 0.85)";
    card.style.color = "#e2e8f0";
    card.style.cursor = "pointer";
    card.style.textAlign = "left";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.gap = "6px";
    list.appendChild(card);
    choiceNodes.push(card);
  }

  document.body.appendChild(overlay);
}

export function maybeOpenUpgrade() {
  if (state.upgradePending || state.paused) return;
  state.upgradePending = true;
  state.paused = true;
  showChoices(getUpgradeChoices());
}

function showChoices(choices) {
  overlay.style.display = "block";
  choiceNodes.forEach((node, idx) => {
    const choice = choices[idx];
    node.innerHTML = "";
    const title = document.createElement("div");
    title.textContent = choice.title;
    title.style.fontWeight = "700";
    const desc = document.createElement("div");
    desc.textContent = choice.desc;
    desc.style.opacity = "0.8";
    node.appendChild(title);
    node.appendChild(desc);
    node.onclick = () => {
      choice.apply();
      state.upgradePending = false;
      state.paused = false;
      overlay.style.display = "none";
    };
  });
}
