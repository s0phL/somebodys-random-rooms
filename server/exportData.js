import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load JSON manually
const highlights = JSON.parse(
  fs.readFileSync(path.join(__dirname, "import/highlights.json"), "utf-8")
);

const books = JSON.parse(
  fs.readFileSync(path.join(__dirname, "import/books.json"), "utf-8")
);

// service account key (keep private!)
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "serviceAccountKey.json"), "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Export highlights in order of JSON file
export async function exportHighlights() {
    console.log("Exporting highlights...");
    const keys = Object.keys(highlights); // preserves JSON order
    //console.log("Highlight keys:", keys);

    for (let i = 0; i < keys.length; i++) {
        const slug = keys[i];
        const data = highlights[slug];

        // add order field to each highlight
        await db.collection("highlights").doc(slug).set({
            ...data,
            order: i
        });
        console.log(`Exported highlight: ${slug}`);
    }

    console.log("✅ Done exporting all highlights");
}

// Export books in order of JSON file
export async function exportBooks() {
    console.log("Exporting books...");
    const keys = Object.keys(books); // preserves JSON order
    //console.log("Book keys:", keys);

    for (let i = 0; i < keys.length; i++) {
        const slug = keys[i];
        const data = books[slug];

        // add order field to each book
        await db.collection("books").doc(slug).set({
            ...data,
            order: i
        });
        console.log(`Exported book: ${slug}`);
    }
    console.log("✅ Done exporting all books");
}

// Run exports (npm run export)
(async () => {
  await exportHighlights();
  await exportBooks();
})();