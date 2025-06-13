import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArchivedBook } from "@/lib/collections/Book";
import { Unsubscribe } from "firebase/auth";

/**
 * Listen to realtime updates for a single archived book.
 * @param userId The user's ID
 * @param id The archived book's ID
 * @param listener Callback invoked with the book or undefined if not found
 * @returns Firebase unsubscribe function
 */
export function listenToArchivedBook(
  userId: string,
  id: string,
  listener: (book: ArchivedBook | undefined) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, "users", userId, "archivedBooks", id),
    (docSnap) => {
      const data = docSnap.data();
      listener(
        data
          ? {
              id: docSnap.id,
              name: data.name || "",
              description: data.description || "",
              balance: data.balance || 0,
              archivedAt: data.archivedAt
                ? data.archivedAt.toDate()
                : new Date(),
            }
          : undefined
      );
    }
  );
}

/**
 * Listen to realtime updates for all archived books.
 * @param userId The user's ID
 * @param listener Callback invoked with a list of archived books
 * @returns Firebase unsubscribe function
 */
export function listenToArchivedBooks(
  userId: string,
  listener: (books: ArchivedBook[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, "users", userId, "archivedBooks"),
    (snapshot) => {
      const books: ArchivedBook[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data) {
          books.push({
            id: docSnap.id,
            name: data.name || "",
            description: data.description || "",
            balance: data.balance || 0,
            archivedAt: data.archivedAt ? data.archivedAt.toDate() : new Date(),
          });
        }
      });
      listener(books);
    }
  );
}

/**
 * Add a book to the user's archived books.
 * @param userId The user's ID
 * @param book Book data
 */
export async function addArchivedBook(
  userId: string,
  book: ArchivedBook
): Promise<void> {
  await addDoc(collection(db, "users", userId, "archivedBooks"), {
    name: book.name,
    description: book.description,
    balance: book.balance || 0,
    archivedAt: new Date(),
  });
}

/**
 * Delete an archived book from the user's collection.
 * @param userId The user's ID
 * @param id The archived book's ID
 */
export async function deleteArchivedBook(
  userId: string,
  id: string
): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "archivedBooks", id));
}
