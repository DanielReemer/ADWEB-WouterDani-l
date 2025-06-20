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
import CategorySidebar from "./CategorySidebar";
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
    const unsubscribeBook = listenToBook(
      user.uid,
      slug,
      (book: Book | undefined) => {
        setLoaded(book);
      }
    );
    return () => {
      unsubscribeBook();
    };
  }, [user.uid, slug, setLoaded, reset]);

  useEffect(() => {
    setTransactionsLoading(true);
    const unsubscribe = listenToTransactions(
      user.uid,
      slug,
      (transactions: Transaction[]) => {
        setTransactions(transactions);
        setBalance(calculateBalance(transactions));
        setTransactionsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user.uid, slug]);

  const handleSaveTransaction = async (
    transaction: TransactionFormData
  ) => {
    const userId = user.uid;
    const bookId = slug;

    return addTransaction(userId, bookId, transaction);
  };

  if (loading) {
    return <Loading />;
  }

  if (!book) {
    return <BookNotFound />;
  }

  return (
  <div className="flex flex-col md:flex-row gap-6">
    <div className="flex-grow w-full max-w-xl flex flex-col gap-4 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
      <BookDetails book={book} balance={balance}/>
      <BookTransactions
        transactions={transactions}
        loading={transactionsLoading}
        error={error}
        onSave={handleSaveTransaction}
      />
    </div>
    <CategorySidebar />
  </div>
  );
}
