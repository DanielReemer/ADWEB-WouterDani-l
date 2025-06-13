import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDoc,
  CollectionReference,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Book } from "@/lib/collections/Book";
import { Unsubscribe } from "firebase/auth";

// Helper to get user's books collection
function userBooksCollection(userId: string) {
  return collection(db, "users", userId, "books");
}
function userArchivedBooksCollection(userId: string) {
  return collection(db, "users", userId, "archivedBooks");
}

export function listenToBook(
  userId: string,
  id: string,
  listener: (book: Book | undefined) => void
): Unsubscribe {
  const unsubscribe = onSnapshot(doc(db, "users", userId, "books", id), (doc) => {
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

export function listenToBooks(userId: string, listener: (books: Book[]) => void): Unsubscribe {
  const unsubscribe = onSnapshot(userBooksCollection(userId), (snapshot) => {
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

export async function addBook(userId: string, book: Omit<Book, "id">): Promise<void> {
  await addDoc(userBooksCollection(userId), {
    name: book.name,
    description: book.description,
    balance: book.balance || 0,
  });
}

export async function updateBook(
  userId: string,
  id: string,
  book: Omit<Book, "id" | "balance">
): Promise<void> {
  await updateDoc(doc(db, "users", userId, "books", id), {
    name: book.name,
    description: book.description,
  });
}

export async function deleteBook(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "books", id));
}

export async function addArchivedBook(userId: string, book: Book): Promise<void> {
  await addDoc(userArchivedBooksCollection(userId), {
    name: book.name,
    description: book.description,
    balance: book.balance || 0,
  });
}

export async function deleteArchivedBook(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "archivedBooks", id));
}

export function listenToArchivedBooks(
  userId: string,
  listener: (books: Book[]) => void
): Unsubscribe {
  const unsubscribe = onSnapshot(userArchivedBooksCollection(userId), (snapshot) => {
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

export function listenToArchivedBook(
  userId: string,
  id: string,
  listener: (book: Book | undefined) => void
): Unsubscribe {
  const unsubscribe = onSnapshot(doc(db, "users", userId, "archivedBooks", id), (doc) => {
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

export async function archiveBook(userId: string, id: string): Promise<void> {
  const bookRef = doc(db, "users", userId, "books", id);
  const archivedRef = doc(db, "users", userId, "archivedBooks", id);

  const bookSnap = await getDoc(bookRef);
  if (!bookSnap.exists()) {
    throw new Error("Book niet gevonden");
  }

  const bookData = bookSnap.data();

  const batch = writeBatch(db);
  batch.set(archivedRef, {
    ...bookData,
    archivedAt: new Date(),
  });
  batch.delete(bookRef);

  await batch.commit();
}

export async function restoreBook(userId: string, id: string): Promise<void> {
  const archivedRef = doc(db, "users", userId, "archivedBooks", id);
  const bookRef = doc(db, "users", userId, "books", id);

  const archivedSnap = await getDoc(archivedRef);
  if (!archivedSnap.exists()) {
    throw new Error("Gearchiveerd boek niet gevonden");
  }

  const archivedData = archivedSnap.data();

  const batch = writeBatch(db);
  batch.set(bookRef, archivedData);
  batch.delete(archivedRef);

  await batch.commit();
}