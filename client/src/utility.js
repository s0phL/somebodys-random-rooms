const sounds = {
    click: new Audio('/assets/sounds/click-sound-effect.mp3'),
};

function playSound(name) {
    sounds[name].currentTime = 0;
    sounds[name].play();
}

document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => playSound("click"));
});