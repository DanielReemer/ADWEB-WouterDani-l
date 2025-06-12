import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Book } from "@/lib/collections/Book";
import { Unsubscribe } from "firebase/auth";

export function listenToBook(
  id: string,
  listener: (book: Book | undefined) => void
): Unsubscribe {
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

export async function addBook(book: Omit<Book, "id">): Promise<void> {
  await addDoc(collection(db, "books"), {
    name: book.name,
    description: book.description,
    balance: book.balance || 0,
  });
}

export async function updateBook(
  id: string,
  book: Omit<Book, "id" | "balance">
): Promise<void> {
  await updateDoc(doc(db, "books", id), {
    name: book.name,
    description: book.description,
  });
}

export async function deleteBook(id: string): Promise<void> {
  await deleteDoc(doc(db, "books", id));
}

export async function addArchivedBook(book: Book): Promise<void> {
  await addDoc(collection(db, "archivedBooks"), {
    name: book.name,
    description: book.description,
    balance: book.balance || 0,
  });
}

export async function deleteArchivedBook(id: string): Promise<void> {
  await deleteDoc(doc(db, "archivedBooks", id));
}

export function listenToArchivedBooks(
  listener: (books: Book[]) => void
): Unsubscribe {
  let unsubscribe = onSnapshot(collection(db, "archivedBooks"), (snapshot) => {
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
  id: string,
  listener: (book: Book | undefined) => void
): Unsubscribe {
  const unsubscribe = onSnapshot(doc(db, "archivedBooks", id), (doc) => {
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

export async function archiveBook(id: string): Promise<void> {
  const bookRef = doc(db, "books", id);
  const archivedRef = doc(db, "archivedBooks", id);

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

export async function restoreBook(id: string): Promise<void> {
  const archivedRef = doc(db, "archivedBooks", id);
  const bookRef = doc(db, "books", id);

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
