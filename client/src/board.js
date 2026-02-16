import { pauseGameInput, resumeGameInput } from "./main.js";
import { fetchHighlights } from "./fetchData.js";

const boardUI = document.getElementById("board-popup");
const binderGrid = document.getElementById("binder-grid");

const galleryUI = document.getElementById("highlights-gallery-popup");
const galleryTitle = document.getElementById("gallery-title");
const mediaGrid = document.getElementById("screenshot-grid");

const polaroidOverlay = document.getElementById("polaroid-overlay");
const mediaFrame = document.getElementById("polaroid-media-frame");
const polaroidImage = document.getElementById("polaroid-image");
const polaroidCaption = document.getElementById("polaroid-caption");
const polaroidCarousel = document.getElementById("polaroid-carousel");

let currentCarouselIndex = 0;
let mangaData = [];
let currentMediaItems = [];
let currentManga = null;

// Fetch highlights from Firestore and render the board UI
async function initBoard() {
    mangaData = await fetchHighlights();
    renderBinders();
}

initBoard();

export function openBoardUI() {
    boardUI.classList.remove("hidden");
    boardUI.classList.remove("minimized");
    pauseGameInput();
}

function closeBoardUI() {
    boardUI.classList.add("hidden");
    resumeGameInput();
}

function renderBinders() {
    binderGrid.innerHTML = "";

    mangaData.forEach((manga) => {
        const binder = document.createElement("div");
        binder.className = "binder";

        binder.innerHTML = `
            <img src="/assets/sprites/binder.png" alt="${manga.title} binder">
            <span class="binder-title">${manga.title}</span>
        `;

        binder.onclick = () => {
            currentManga = manga;
            openGallery(manga);
        };
        binderGrid.appendChild(binder);
    });
}

function openGallery(manga) {
    galleryUI.classList.remove("hidden");
    mediaGrid.innerHTML = "";
    galleryTitle.textContent = manga.title;

    // screenshots
    manga.screenshots?.forEach((item) => {

        // paired screenshots
        if (item.pair) {
            const pairWrapper = document.createElement("div");
            pairWrapper.className = "screenshot-pair";

            item.pair.forEach(screenshot => {
                const img = document.createElement("img");
                img.src = screenshot.src;
                img.alt = `${manga.title} screenshot`;
                pairWrapper.appendChild(img);
            });

            pairWrapper.onclick = () =>
            openPolaroidPair(item.pair.map(p => p.src), manga, item.caption);

            mediaGrid.appendChild(pairWrapper);
            return;
        }

        // single screenshot
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = `${manga.title} screenshot`;
        img.className = "screenshot";

        img.onclick = () => openPolaroidImage(item.src, manga, item.caption);

        mediaGrid.appendChild(img);
    });

    // clips
    manga.clips?.forEach(clip => {
        const wrapper = document.createElement("div");
        wrapper.className = "clip-thumb";

        renderClipThumbnail(clip, wrapper);
        addHoverPreview(wrapper, clip);

        const img = document.createElement("img");
        wrapper.appendChild(img);

        const playIcon = document.createElement("div");
        playIcon.className = "play-icon";
        playIcon.textContent = "▶";
        wrapper.appendChild(playIcon);

        wrapper.onclick = () => openPolaroidClip(clip, manga, clip.caption);
        mediaGrid.appendChild(wrapper);
    });
}

function openPolaroidImage(src, manga, caption) {
    polaroidOverlay.style.display = "flex";

    removeVideo();
    mediaFrame.innerHTML = "";

    polaroidImage.src = src;
    polaroidImage.style.display = "block";
    polaroidCaption.textContent = caption || manga.title;

    mediaFrame.appendChild(polaroidImage);

    renderCarousel(manga, src);
}

function openPolaroidPair(srcList, manga, caption) {
    polaroidOverlay.style.display = "flex";
  
    removeVideo();
    mediaFrame.innerHTML = "";
    //polaroidImage.style.display = "none";

    const container = document.createElement("div");
    container.className = "polaroid-pair";

    srcList.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        container.appendChild(img);
    });

    mediaFrame.appendChild(container);
    polaroidCaption.textContent = caption || manga.title;

    renderCarousel(manga, srcList[0]);
}

function openPolaroidClip(clip, manga, caption) {
    polaroidOverlay.style.display = "flex";

    //polaroidImage.style.display = "none";
    removeVideo();
    mediaFrame.innerHTML = "";

    // create video
    const video = document.createElement("video");
    video.src = clip.src;
    video.controls = true;
    video.autoplay = true;
    video.className = "polaroid-video";

    mediaFrame.appendChild(video);

    polaroidCaption.textContent = caption || manga.title;

    renderCarousel(manga, clip.src);
}

function renderCarousel(manga, activeSrc = null) {
    polaroidCarousel.innerHTML = "";

    currentMediaItems = [
        ...manga.screenshots.map(s =>
            s.pair
                ? { type: "pair", ...s }
                : { type: "image", ...s }
        ),
        ...(manga.clips ?? []).map(c => ({ type: "clip", ...c }))
    ];

    currentMediaItems.forEach((item, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "carousel-thumb";

        if (item.type === "image") {
            const img = document.createElement("img");
            img.src = item.src;
            wrapper.appendChild(img);
        }
        else if (item.type === "pair") {
            wrapper.classList.add("pair");

            item.pair.forEach(p => {
                const img = document.createElement("img");
                img.src = p.src;
                wrapper.appendChild(img);
            });
        }
        else { // clip
            renderClipThumbnail(item, wrapper);

            const play = document.createElement("div");
            play.className = "play-icon small";
            play.textContent = "▶";
            wrapper.appendChild(play);
        }

        wrapper.onclick = () => {
            currentCarouselIndex = index;
            setActiveThumb(index);

            if (item.type === "image") {
                openPolaroidImage(item.src, manga, item.caption);
            } 
            else if (item.type === "pair") {
                openPolaroidPair(item.pair.map(p => p.src), manga, item.caption);
            }
            else { // clip
                openPolaroidClip(item, manga, item.caption);
            }
        };

        polaroidCarousel.appendChild(wrapper);

        // detect active item on open
        if (
            (item.type === "image" && item.src === activeSrc) ||
            (item.type === "clip" && item.src === activeSrc) ||
            (item.type === "pair" && item.pair?.some(p => p.src === activeSrc))
        ) {
            currentCarouselIndex = index;
        }
    });

    setActiveThumb(currentCarouselIndex);
}

function setActiveThumb(index) {
    const thumbs = polaroidCarousel.querySelectorAll(".carousel-thumb");

    thumbs.forEach((thumb, i) => {
        thumb.classList.toggle("active", i === index);
    });

    const activeThumb = thumbs[index];
    if (!activeThumb) return;

    // center it smoothly
    const containerRect = polaroidCarousel.getBoundingClientRect();
    const thumbRect = activeThumb.getBoundingClientRect();

    const offset =
        thumbRect.left -
        containerRect.left -
        containerRect.width / 2 +
        thumbRect.width / 2;

    polaroidCarousel.scrollBy({
        left: offset,
        behavior: "smooth"
    });
}

function generateVideoThumbnail(videoSrc, time = 0.1) {
    return new Promise((resolve) => {
        const video = document.createElement("video");
        video.src = videoSrc;
        video.crossOrigin = "anonymous";
        video.muted = true;

        video.addEventListener("loadeddata", () => {
            video.currentTime = time;
        });

        video.addEventListener("seeked", () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            resolve(canvas.toDataURL("image/png"));
        });
    });
}

async function renderClipThumbnail(clip, wrapper) {
    const img = document.createElement("img");

    if (clip.thumbnail) {
        img.src = clip.thumbnail;
    } else {
        img.src = await generateVideoThumbnail(clip.src);
    }

    wrapper.appendChild(img);
}

function addHoverPreview(wrapper, clip) {
    const preview = document.createElement("video");
    preview.src = clip.src;
    preview.muted = true;
    preview.loop = true;
    preview.playsInline = true;

    wrapper.appendChild(preview);

    wrapper.addEventListener("mouseenter", () => {
        preview.currentTime = 0.2;
        preview.play();
    });

    wrapper.addEventListener("mouseleave", () => {
        preview.pause();
    });
}

// arrow key navigation for carousel
function navigatePolaroid(direction) {
    if (polaroidOverlay.style.display === "none") return;

    const total = currentMediaItems.length;

    currentCarouselIndex =
        (currentCarouselIndex + direction + total) % total;

    const item = currentMediaItems[currentCarouselIndex];

    if (item.type === "image") {
        openPolaroidImage(item.src, currentManga, item.caption);
    } 
    else if (item.type === "pair") {
        openPolaroidPair(
            item.pair.map(p => p.src),
            currentManga,
            item.caption
        );
    } 
    else {
        openPolaroidClip(item, currentManga, item.caption);
    }
}


// Remove any existing video
function removeVideo() {
    const video = mediaFrame.querySelector("video");
    if (video) {
        video.pause();
        video.currentTime = 0; // reset to start
        video.remove();
    }
}


document.getElementById("board-close-btn").onclick = closeBoardUI;

const minimizeBtn = document.getElementById("board-minimize-btn");
minimizeBtn.onclick = () => {
  boardUI.classList.toggle("minimized");
  resumeGameInput();
};

document.getElementById("gallery-close-btn").onclick = () => {
    galleryUI.classList.add("hidden");
};

document.getElementById("polaroid-close-btn").onclick = () => {
    polaroidOverlay.style.display = "none";
    removeVideo();
};

document.getElementById("fullscreen-btn").onclick = () => {
    if (!polaroidOverlay.style.display || polaroidOverlay.style.display === "none") return;

    // get the currently displayed element in the mediaFrame
    const currentMedia = mediaFrame.querySelector("img, video, .polaroid-pair");
    if (!currentMedia) return;

    if (currentMedia.requestFullscreen) {
        currentMedia.requestFullscreen();
    }
};


// (POLAROID POPUP): close when clicking outside the popup
const popupContent = document.querySelector('.polaroid');

polaroidOverlay.addEventListener('click', (e) => {
    if (!popupContent.contains(e.target)) {
        polaroidOverlay.style.display = 'none';
        removeVideo();
    }
});

// prevent clicks inside the popup from closing it
popupContent.addEventListener('click', (e) => {
    e.stopPropagation();
});

// key controls
document.addEventListener("keydown", (e) => {
    const isFullscreen = !!document.fullscreenElement;
    // disable arrow navigation if in fullscreen
    if (isFullscreen) {
        e.preventDefault();
        return;
    }

    // arrow key navigation for carousel only if overlay is visible
    if (polaroidOverlay.style.display === "flex") {

        if (e.key === "ArrowRight") {
            e.preventDefault();
            navigatePolaroid(1);
        }
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            navigatePolaroid(-1);
        }

        // close polaroid with Escape key
        if (e.key === "Escape") {
            polaroidOverlay.style.display = "none"; 
            removeVideo();
        }
    }
    // if gallery is open, close it
    else if (!galleryUI.classList.contains("hidden")) {
        galleryUI.classList.add("hidden");
    }
    // if board UI is open, close it
    else if (!boardUI.classList.contains("hidden")) {
        closeBoardUI();
    }
});