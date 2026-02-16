const base = import.meta.env.BASE_URL; // vite base url

const sounds = {
    click: new Audio(`${base}assets/sounds/click-sound-effect.mp3`),
};

function playSound(name) {
    sounds[name].currentTime = 0;
    sounds[name].play();
}

document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => playSound("click"));
});