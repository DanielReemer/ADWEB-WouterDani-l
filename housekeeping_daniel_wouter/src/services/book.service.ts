import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Book } from "@/lib/collections/Book";
import { Unsubscribe } from "firebase/auth";

/**
 * Listen to realtime updates for a single book.
 * @param userId The user's ID
 * @param id The book's ID
 * @param listener Callback invoked with the book or undefined if not found
 * @returns Firebase unsubscribe function
 */
export function listenToBook(
  userId: string,
  id: string,
  listener: (book: Book | undefined) => void
): Unsubscribe {
  return onSnapshot(doc(db, "users", userId, "books", id), (docSnap) => {
    const data = docSnap.data();
    listener(
      data
        ? {
            id: docSnap.id,
            name: data.name || "",
            description: data.description || "",
            balance: data.balance || 0,
          }
        : undefined
    );
  });
}

/**
 * Listen to realtime updates for all books.
 * @param userId The user's ID
 * @param listener Callback invoked with a list of books
 * @returns Firebase unsubscribe function
 */
export function listenToBooks(
  userId: string,
  listener: (books: Book[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, "users", userId, "books"), (snapshot) => {
    const books: Book[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data) {
        books.push({
          id: docSnap.id,
          name: data.name || "",
          description: data.description || "",
          balance: data.balance || 0,
        });
      }
    });
    listener(books);
  });
}

/**
 * Add a new book to the user's collection.
 * @param userId The user's ID
 * @param book Book data, without ID
 */
export async function addBook(
  userId: string,
  book: Omit<Book, "id">
): Promise<void> {
  await addDoc(collection(db, "users", userId, "books"), {
    name: book.name,
    description: book.description,
    balance: book.balance || 0,
  });
}

/**
 * Update an existing book's name or description.
 * @param userId The user's ID
 * @param id The book's ID
 * @param book Book data, excluding ID and balance
 */
export async function updateBook(
  userId: string,
  id: string,
  book: Omit<Book, "id">
): Promise<void> {
  await updateDoc(doc(db, "users", userId, "books", id), {
    name: book.name,
    description: book.description,
  });
}

/**
 * Delete a book from the user's collection.
 * @param userId The user's ID
 * @param id The book's ID
 */
export async function deleteBook(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "books", id));
}

/**
 * Share a book with another user.
 * @param ownerId The ID of the user who owns the book.
 * @param bookId The book's ID.
 * @param targetUserId The ID of the user to share the book with.
 * @returns Promise resolving when the book is shared.
 */
export async function shareBook(
  ownerId: string,
  bookId: string,
  targetUserId: string
): Promise<void> {
  const bookRef = doc(db, "users", ownerId, "books", bookId);
  const bookSnap = await getDoc(bookRef);
  const data = bookSnap.data();
  if (!data) return;
  await setDoc(doc(db, "users", targetUserId, "sharedBooks", bookId), {
    ownerId,
    ...data,
  });
}

/**
 * Listen to realtime updates for all books shared with a user.
 * @param userId The user's ID.
 * @param listener Callback invoked with a list of shared books.
 * @returns Firebase unsubscribe function.
 */
export function listenToSharedBooks(
  userId: string,
  listener: (books: (Book & { ownerId: string })[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, "users", userId, "sharedBooks"),
    (snapshot) => {
      const books: (Book & { ownerId: string })[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data) {
          books.push({
            id: docSnap.id,
            name: data.name || "",
            description: data.description || "",
            balance: data.balance || 0,
            ownerId: data.ownerId,
          });
        }
      });
      listener(books);
    }
  );
}

export async function acceptBookShare(
  invitationId: string,
  userId: string,
  bookId: string,
  ownerId: string
): Promise<void> {
  const bookRef = doc(db, "users", ownerId, "books", bookId);
  const bookSnap = await getDoc(bookRef);
  const data = bookSnap.data();
  if (!data) return;
  await setDoc(doc(db, "users", userId, "sharedBooks", bookId), {
    ownerId,
    ...data,
  });
}