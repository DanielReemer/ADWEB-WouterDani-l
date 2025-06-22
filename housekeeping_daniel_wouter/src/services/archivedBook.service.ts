import {
  onSnapshot,
  collection,
  query,
  and,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Book } from "@/lib/collections/Book";
import { Unsubscribe } from "firebase/auth";

export function listenToArchivedBooks(
  userId: string,
  listener: (books: Book[] | undefined) => void
): Unsubscribe {
  const booksQuery = query(
    collection(db, "books"),
    and(
      where("archivedAt", "!=", null),
      where("ownerId", "==", userId),
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
        archivedAt: data.archivedAt ? data.archivedAt.toDate() : undefined,
      } as Book);
    });
    listener(books.length > 0 ? books : undefined);
  });
}
