import { doc, onSnapshot, collection, addDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase";
import { Book } from "@/lib/collections/Book";
import { Unsubscribe } from "firebase/auth";

export function listenToBook(id: string, listener: (book: Book | undefined) => void): Unsubscribe {
    const unsubscribe = onSnapshot(doc(db, "books", id), (doc) => {
        const data = doc.data();
        let res = undefined;
        if (data) {
            res = {
                id: doc.id,
                name: data.name || "",
                description: data.description || "",
                balance: data.balance || 0,
            };
        }

        listener(res);
    });

    return unsubscribe;
}

export function listenToBooks(listener: (books: Book[]) => void): Unsubscribe {
    let unsubscribe = onSnapshot(collection(db, "books"), (snapshot) => {
        const books: Book[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();

            if (data) {
                books.push({
                    id: doc.id,
                    name: data.name || "",
                    description: data.description || "",
                    balance: data.balance || 0,
                });
            }
        });
        
        listener(books);
    });

    return unsubscribe;
}

export async function addBook(book: Omit<Book, "id" | "balance">): Promise<void> {
    await addDoc(collection(db, "books"), {
        name: book.name,
        description: book.description,
    })
}

export async function updateBook(id: string, book: Omit<Book, "id" | "balance">): Promise<void> {
    await updateDoc(doc(db, "books", id), {
        name: book.name,
        description: book.description,
    });
}