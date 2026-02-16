import { pauseGameInput, resumeGameInput } from "./main.js";
import { fetchBooks } from "./fetchData.js";

const bookshelfUI = document.getElementById("bookshelf-popup");
const gallery = document.getElementById("book-gallery");
const overlay = document.getElementById("book-overlay");
const bookImage = document.getElementById('bookImage');
const bookTitle = document.getElementById('bookTitle');
const bookDescription = document.getElementById('bookDescription');
const bookReviews = document.getElementById('bookReviews');
const carousel = document.getElementById('book-carousel');

const BOOKS_PER_SHELF = 3;
let currentCarouselIndex = 0;
let currentGallery, galleryA, galleryB;

// Fetch books from Firestore, initialize gallery data,
// set the default gallery (A), and render the bookshelf UI.
async function initBookshelf() {
    ({ galleryA, galleryB } = await fetchBooks());
    currentGallery = galleryA;
    renderBookshelf(currentGallery);
}

initBookshelf();

export function openBookshelfUI() {
    bookshelfUI.classList.remove("hidden");
    bookshelfUI.classList.remove("minimized");
    pauseGameInput();
}

function closeBookshelfUI() {
    bookshelfUI.classList.add("hidden");
    currentGallery = galleryA;
    renderBookshelf(currentGallery);
    resumeGameInput();
}

function renderBookshelf(bookArray) {
    gallery.innerHTML = "";

    let currentShelf;
    let count = 0;

    bookArray.forEach((book, index) => {
        if (count === 0) {
        currentShelf = document.createElement("div");
        currentShelf.className = "bookshelf";
        currentShelf.innerHTML = `
            <div class="book-grid">
                <ul></ul>
            </div>
            <div class="shelf-shadows"></div>
            <div class="shelf"></div>
        `;
        gallery.appendChild(currentShelf);
        }

        const ul = currentShelf.querySelector("ul");
        const li = document.createElement("li");
        li.className = "book";

        const img = document.createElement("img");
        img.src = book.image;
        img.alt = book.title;

        li.appendChild(img);
        li.onclick = () => {
            currentCarouselIndex = index;
            openBookPopup(currentCarouselIndex);
            setActiveThumb(currentCarouselIndex);
        };

        ul.appendChild(li);

        count = (count + 1) % BOOKS_PER_SHELF;
    });
}

function openBookPopup(index) {
    const book = currentGallery[index];
    bookImage.src = book.image;
    bookTitle.textContent = book.title;
    bookDescription.textContent = book.description;
    bookReviews.innerHTML = book.review
        .split('\n')
        .map(paragraph => `<p>${paragraph}</p><br>`)
        .join('');
    overlay.style.display = "block";

    // render a carousel with all the books in the current gallery
    carousel.innerHTML = '';
    currentGallery.forEach((b, i) => {
        const img = document.createElement('img');
        img.src = b.image;

        setActiveThumb(currentCarouselIndex);

        img.onclick = () => {
            currentCarouselIndex = i;
            setActiveThumb(currentCarouselIndex);
            openBookPopup(currentCarouselIndex);
        };
        carousel.appendChild(img);
    });

    overlay.style.display = "flex";

    // force reflow to restart animations
    bookImage.style.animation = "none";
    bookImage.offsetHeight;
    bookImage.style.animation = "";

    document.querySelectorAll(".island").forEach(island => {
        island.style.animation = "none";
        island.offsetHeight;
        island.style.animation = "";
    });
}

function setActiveThumb(index) {
    const thumbs = carousel.querySelectorAll("img");

    thumbs.forEach((thumb, i) => {
        thumb.classList.toggle("active", i === index);
    });

    const activeThumb = thumbs[index];
    if (!activeThumb) return;

    // center it smoothly
    const containerRect = carousel.getBoundingClientRect();
    const thumbRect = activeThumb.getBoundingClientRect();

    const offset =
        thumbRect.left -
        containerRect.left -
        containerRect.width / 2 +
        thumbRect.width / 2;

    carousel.scrollBy({
        left: offset,
        behavior: "smooth"
    });
}

// arrow key navigation for carousel
function navigateBook(direction) {
    if (overlay.style.display === "none") return;

    const total = currentGallery.length;

    currentCarouselIndex =
        (currentCarouselIndex + direction + total) % total;

    openBookPopup(currentCarouselIndex);
}


document.getElementById("bookshelf-close-btn").onclick = closeBookshelfUI;

const minimizeBtn = document.getElementById("bookshelf-minimize-btn");
minimizeBtn.onclick = () => {
    bookshelfUI.classList.toggle("minimized");
    resumeGameInput();
};

document.getElementById("book-popup-close-btn").onclick = function() {
    overlay.style.display = "none";
};

const moreBooksBtn = document.getElementById("more-books-btn");
const bookshelfTitle = document.getElementById("bookshelf-title");

moreBooksBtn.onclick = () => {
    //currentGallery = currentGallery === galleryA ? galleryB : galleryA;
    if (currentGallery === galleryA) {
        currentGallery = galleryB;
        moreBooksBtn.textContent = "Back"
        bookshelfTitle.textContent = "More Books";
    } else {
        currentGallery = galleryA;
        moreBooksBtn.textContent = "More Books"
        bookshelfTitle.textContent = "My Top Picks";
    }
    gallery.scrollTop = 0; // reset scroll to top when switching galleries
    renderBookshelf(currentGallery);
};


// (BOOK POPUP): close when clicking outside the popup
const popupContent = document.querySelector('.popup');

overlay.addEventListener('click', (e) => {
    if (!popupContent.contains(e.target)) {
        overlay.style.display = 'none';
    }
});

// prevent clicks inside the popup from closing it
popupContent.addEventListener('click', (e) => {
    e.stopPropagation();
});

// key controls
document.addEventListener("keydown", (e) => {
    // arrow key navigation for carousel only if overlay is visible
    if (overlay.style.display === "flex") {

        if (e.key === "ArrowRight") {
            e.preventDefault();
            navigateBook(1);
        }
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            navigateBook(-1);
        }

        // close popup with Escape key
        if (e.key === "Escape") {
            overlay.style.display = "none";
        }
    }
    else if (!bookshelfUI.classList.contains("hidden")) {
        // Close bookshelf UI if Escape pressed and overlay is NOT open
        if (e.key === "Escape") {
            closeBookshelfUI();
        }
    }
});