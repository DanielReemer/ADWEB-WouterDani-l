import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  or,
  and,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Book } from "@/lib/collections/Book";
import { Unsubscribe } from "firebase/auth";
import { BookFormData } from "@/app/books/BookForm";

export function listenToBook(
  bookId: string,
  listener: (book: Book | undefined) => void
): Unsubscribe {
  return onSnapshot(doc(db, "books", bookId), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();

      if (data.archivedAt) {
        return;
      }

      listener({
        id: docSnap.id,
        ownerId: data.ownerId || "",
        name: data.name || "",
        description: data.description || "",
        transactionIds: data.transactionIds || [],
        sharedWith: data.sharedWith || [],
      } as Book);

      return;
    }
    listener(undefined);
  });
}

export function listenToBooks(
  userId: string,
  listener: (books: Book[] | undefined) => void
): Unsubscribe {
  const booksQuery = query(
    collection(db, "books"),
    and(
      where("archivedAt", "==", null),
      or(
        where("ownerId", "==", userId),
        where("sharedWith", "array-contains", userId)
      )
    )
  );

  return onSnapshot(booksQuery, (snapshot) => {
    const books: Book[] = [];
    snapshot.forEach((docSnap) => {
      if (!docSnap.exists()) return undefined;
      const data = docSnap.data();
      books.push({
        id: docSnap.id,
        name: data.name || "",
        description: data.description || "",
        ownerId: data.ownerId || "",
        transactionIds: data.transactionIds || [],
        sharedWith: data.sharedWith || [],
      } as Book);
    });
    listener(books.length > 0 ? books : undefined);
  });
}

export async function addBook(
  userId: string,
  bookFormData: BookFormData
): Promise<void> {
  await addDoc(collection(db, "books"), {
    name: bookFormData.name,
    description: bookFormData.description || "",
    ownerId: userId,
    transactionIds: [],
    sharedWith: [],
    archivedAt: null,
  });
}

export async function updateBook(
  bookId: string,
  book: BookFormData
): Promise<void> {
  await updateDoc(doc(db, "books", bookId), {
    name: book.name,
    description: book.description || "",
  });
}

export async function deleteBook(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "books", id));
}

export async function acceptBookShare(
  invitationId: string,
  userId: string,
  bookId: string
): Promise<void> {
  const bookRef = doc(db, "books", bookId);
  const bookSnap = await getDoc(bookRef);

  const data = bookSnap.data();
  if (!data) return;

  await updateDoc(doc(db, "books", bookId), {
    sharedWith: [...(data.sharedWith || []), userId],
  });
  await deleteDoc(doc(db, "shareInvitations", invitationId));
}
