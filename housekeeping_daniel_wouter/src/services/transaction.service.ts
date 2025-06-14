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
  } from "firebase/firestore";
  import { db } from "@/lib/firebase";
  import Transaction from "@/lib/Transaction";
  
  /**
   * Listen to realtime updates for all transactions.
   * @param userId The user's ID
   * @param bookId The book's ID
   * @param listener Callback invoked with a list of transactions
   * @returns Firebase unsubscribe function
   */
  export function listenToTransactions(
    userId: string,
    bookId: string,
    listener: (transactions: Transaction[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, "users", userId, "books", bookId, "transactions"),
      orderBy("date", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const transactions: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        transactions.push({
          id: docSnap.id,
          description: data.description || "",
          amount: data.amount || 0,
          type: data.type || "",
          date: data.date,
        });
      });
      listener(transactions);
    });
  }
  
  /**
   * Listen to realtime updates for a single transaction.
   * @param userId The user's ID
   * @param bookId The book's ID
   * @param transactionId The transaction's ID
   * @param listener Callback invoked with the transaction or null if not found
   * @returns Firebase unsubscribe function
   */
  export function listenToTransaction(
    userId: string,
    bookId: string,
    transactionId: string,
    listener: (transaction: Transaction | null) => void
  ): Unsubscribe {
    return onSnapshot(
      doc(
        db,
        "users",
        userId,
        "books",
        bookId,
        "transactions",
        transactionId
      ),
      (docSnap) => {
        const data = docSnap.data();
        listener(
          data
            ? {
                id: docSnap.id,
                description: data.description || "",
                amount: data.amount || 0,
                type: data.type || "",
                date: data.date,
              }
            : null
        );
      }
    );
  }
  
  /**
   * Add a transaction to a book.
   * @param userId The user's ID
   * @param bookId The book's ID
   * @param transaction Transaction data
   */
  export async function addTransaction(
    userId: string,
    bookId: string,
    transaction: Omit<Transaction, "id">
  ): Promise<void> {
    await addDoc(collection(db, "users", userId, "books", bookId, "transactions"), {
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date,
    });
  }
  
  /**
   * Update an existing transaction.
   * @param userId The user's ID
   * @param bookId The book's ID
   * @param transactionId The transaction's ID
   * @param transaction Partial transaction data to update
   */
  export async function updateTransaction(
    userId: string,
    bookId: string,
    transactionId: string,
    transaction: Partial<Transaction>
  ): Promise<void> {
    await updateDoc(
      doc(db, "users", userId, "books", bookId, "transactions", transactionId),
      {
        ...transaction,
      }
    );
  }
  
  /**
   * Delete a transaction from a book.
   * @param userId The user's ID
   * @param bookId The book's ID
   * @param transactionId The transaction's ID
   */
  export async function deleteTransaction(
    userId: string,
    bookId: string,
    transactionId: string
  ): Promise<void> {
    await deleteDoc(
      doc(db, "users", userId, "books", bookId, "transactions", transactionId)
    );
  }