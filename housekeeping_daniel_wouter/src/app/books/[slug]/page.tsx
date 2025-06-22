"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLoading } from "@/lib/hooks/useLoading";
import { listenToBook } from "@/services/book.service";
import { Book } from "@/lib/collections/Book";
import Loading from "@/app/loading";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import Transaction from "@/lib/Transaction";
import {
  addTransaction,
  listenToTransactions,
} from "@/services/transaction.service";
import BookDetails from "@/app/books/[slug]/BookDetails";
import BookNotFound from "@/app/books/[slug]/BookNotFound";
import BookTransactions from "@/app/books/[slug]/BookTransactions";
import { TransactionFormData } from "@/app/books/[slug]/TransactionForm";
import { calculateBalance } from "@/lib/utils/calculateBalance";

export default function BookPage() {
  const { loading, data: book, setLoaded, reset } = useLoading<Book>();
  const { slug } = useParams<{ slug: string }>();
  const user = useRequireUser();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    reset();
    const unsubscribeBook = listenToBook(slug, setLoaded);
    return () => unsubscribeBook();
  }, [slug, reset, setLoaded]);
  
  useEffect(() => {
    console.log("Book loaded:", book);
    if (!book?.transactionIds) return;
    setTransactionsLoading(true);
    const unsubscribe = listenToTransactions(book.transactionIds, (transactions) => {
      setTransactions(transactions);
      setBalance(calculateBalance(transactions));
      setTransactionsLoading(false);
    });
    return () => unsubscribe();
  }, [book?.transactionIds]);

  const handleSaveTransaction = async (
    transaction: TransactionFormData
  ) => {
    const userId = user.uid;
    const bookId = slug;

    return addTransaction(bookId, transaction);
  };

  if (loading) {
    return <Loading />;
  }

  if (!book) {
    return <BookNotFound />;
  }

  return (
    <div className="w-full h-full max-w-xl flex flex-col gap-4 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
      <BookDetails book={book} balance={balance}/>
      <BookTransactions
        transactions={transactions}
        loading={transactionsLoading}
        error={error}
        onSave={handleSaveTransaction}
      />
    </div>
  );
}
