import { pauseGameInput, resumeGameInput } from "./main.js";

const infoUI = document.getElementById("info-popup");

export function openInfoUI() {
    infoUI.classList.remove("hidden");
    infoUI.classList.remove("minimized");
    pauseGameInput();
}

function closeInfoUI() {
  infoUI.classList.add("hidden");
  resumeGameInput();
}

document.getElementById("info-close-btn").onclick = closeInfoUI;

const minimizeBtn = document.getElementById("info-minimize-btn");
minimizeBtn.onclick = () => {
  infoUI.classList.toggle("minimized");
  resumeGameInput();
};