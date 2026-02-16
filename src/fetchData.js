import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

// Minimal config for client (public, read-only)
const firebaseConfig = {
  apiKey: "AIzaSyCFejOL4tTQ-jxcFErAo7QGNE5tOd3JYDY",
  authDomain: "somebodys-random-rooms.firebaseapp.com",
  projectId: "somebodys-random-rooms",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch all highlights from Firestore, ordered by the "order" field, and return as an array
export async function fetchHighlights() {
    const highlightsCol = await getDocs(query(collection(db, "highlights"), orderBy("order")));

    const highlights = highlightsCol.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    console.log("Fetched highlights:", highlights);

    return highlights;
}

// Fetch all books from Firestore, ordered by the "order" field, and return as an array
export async function fetchBooks() {
    const booksCol = await getDocs(query(collection(db, 'books'), orderBy("order")));
    const galleryA = [];
    const galleryB = [];

    booksCol.forEach(doc => {
        const book = { slug: doc.id, ...doc.data() };
        if (book.gallery === "A") galleryA.push(book);
        else if (book.gallery === "B") galleryB.push(book);
    });

    console.log("Fetched books:", { galleryA, galleryB });

    return { galleryA, galleryB };
}