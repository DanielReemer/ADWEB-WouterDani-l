import { doc, writeBatch, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Archive a book by moving it to the archivedBooks collection.
 * @param userId The user's ID
 * @param id The book's ID
 * @throws If the book does not exist
 */
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

/**
 * Restore an archived book by moving it back to the books collection.
 * @param userId The user's ID
 * @param id The archived book's ID
 * @throws If the archived book does not exist
 */
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