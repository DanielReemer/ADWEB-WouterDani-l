import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function archiveBook(bookId: string): Promise<void> {
  try {
    const bookRef = doc(db, "books", bookId);
    const bookSnapshot = await getDoc(bookRef);

    if (!bookSnapshot.exists()) {
      throw new Error(`Book with ID ${bookId} does not exist.`);
    }

    const bookData = bookSnapshot.data();
    await updateDoc(bookRef, {
      archivedAt: serverTimestamp(),
    });

    const transactionPromises = bookData.transactionIds.map(
      async (transactionId: string) => {
        const transactionRef = doc(db, "transactions", transactionId);
        const transactionSnapshot = await getDoc(transactionRef);

        if (!transactionSnapshot.exists()) {
          throw new Error(
            `Transaction with ID ${transactionId} does not exist.`
          );
        }

        return updateDoc(transactionRef, {
          archivedAt: serverTimestamp(),
        });
      }
    );

    await Promise.all(transactionPromises);
  } catch (error) {
    console.error("Failed to archive book and its transactions:", error);
    throw error;
  }
}

export async function restoreBook(
  userId: string,
  bookId: string
): Promise<void> {
  const bookRef = doc(db, "books", bookId);
  const bookSnapshot = await getDoc(bookRef);

  if (!bookSnapshot.exists()) {
    throw new Error(`Book with ID ${bookId} does not exist.`);
  }

  const bookData = bookSnapshot.data();
  if (bookData.ownerId !== userId) {
    throw new Error("You are not authorized to restore this book.");
  }

  await updateDoc(bookRef, {
    archivedAt: null,
  });

  const transactionPromises = bookData.transactionIds.map(
    (transactionId: string) => {
      const transactionRef = doc(db, "transactions", transactionId);
      return updateDoc(transactionRef, {
        archivedAt: null,
      });
    }
  );

  await Promise.all(transactionPromises);
}
