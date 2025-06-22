import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  Unsubscribe,
  where,
  getDoc,
  and,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Transaction, { TransactionFormData } from "@/lib/Transaction";
import { arch } from "os";

export function listenToTransactions(
  transactionIds: string[],
  listener: (transactions: Transaction[]) => void
): Unsubscribe {
  if (transactionIds.length === 0) {
    listener([]);
    return () => {};
  }
  
  const transactionsQuery = query(
    collection(db, "transactions"),
    and(
      where("archivedAt", "==", null),
      where("__name__", "in", transactionIds)
    ),
    orderBy("date", "desc")
  );

  return onSnapshot(transactionsQuery, (snapshot) => {
    const transactions: Transaction[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        bookId: data.bookId || "",
        description: data.description || "",
        amount: data.amount || 0,
        type: data.type || "",
        date: data.date,
      } as Transaction;
    });
    listener(transactions);
  });
}

export function listenToTransaction(
  transactionId: string,
  listener: (transaction: Transaction | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "transactions", transactionId), (docSnap) => {
    const data = docSnap.data();

    listener(
      data
        ? {
            id: docSnap.id,
            bookId: data.bookId || "",
            description: data.description || "",
            amount: data.amount || 0,
            type: data.type || "",
            date: data.date,
          }
        : null
    );
  });
}

export async function addTransaction(
  bookId: string,
  transactionFormData: TransactionFormData
): Promise<void> {
  const newTransaction = await addDoc(collection(db, "transactions"), {
    bookId: bookId,
    description: transactionFormData.description,
    amount: transactionFormData.amount,
    type: transactionFormData.type,
    date: transactionFormData.date,
    archivedAt: null,
  });

  const bookRef = doc(db, "books", bookId);
  const bookSnapshot = await getDoc(bookRef);
  const currentTransactionIds = bookSnapshot.exists()
    ? (bookSnapshot.data().transactionIds || []) as string[]
    : [];

  await updateDoc(bookRef, {
    transactionIds: [...currentTransactionIds, newTransaction.id],
  });
}

export async function updateTransaction(
  transactionId: string,
  transactionFormData: TransactionFormData
): Promise<void> {
  await updateDoc(doc(db, "transactions", transactionId), {
    description: transactionFormData.description,
    amount: transactionFormData.amount,
    type: transactionFormData.type,
    date: transactionFormData.date,
  });
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  await deleteDoc(doc(db, "transactions", transactionId));
}
