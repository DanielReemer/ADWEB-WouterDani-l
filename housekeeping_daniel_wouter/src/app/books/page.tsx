"use client";
import BookList from "./BookList";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listenToBooks } from "@/services/book.service";
import { Book } from "@/lib/collections/Book";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { listenToTransactions } from "@/services/transaction.service";
import Transaction from "@/lib/Transaction";
import { calculateBalance } from "@/lib/utils/calculateBalance";

export default function BookPage() {
  const user = useRequireUser();
  const [books, setBooks] = useState<Book[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [transactionsPerBook, setTransactionsPerBook] = useState<
    Record<string, Transaction[]>
  >({});

  useEffect(() => {
    const unsubscribe = listenToBooks(user.uid, setBooks);
    return unsubscribe;
  }, [user.uid]);

  useEffect(() => {
    const unsubscribes = books.map((book: Book) =>
      listenToTransactions(user.uid, book.id, (transactions) =>
        setAllTransactions((prev) => [
          ...prev.filter((t) => t.bookId !== book.id),
          ...transactions,
        ])
      )
    );
    return () => unsubscribes.forEach((unsub) => unsub && unsub());
  }, [user.uid, books]);

  useEffect(() => {
    const transactionsMap: Record<string, Transaction[]> = {};
    allTransactions.forEach((transaction) => {
      if (!transactionsMap[transaction.bookId])
        transactionsMap[transaction.bookId] = [];
      transactionsMap[transaction.bookId].push(transaction);
    });
    setTransactionsPerBook(transactionsMap);
  }, [allTransactions]);

  return (
    <section className="w-full h-full max-w-3xl flex flex-col justify-center items-center gap-4 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
      <div className="flex items-center w-full">
        <h2 className="text-3xl font-bold text-blue-600 flex-1 text-center">
          Huishoudboekjes
        </h2>
      </div>
      <p className="text-gray-500 mb-4 text-center">
        Hier vind je een overzicht van al jouw boeken. Klik op een boek om de
        details te bekijken of om het te bewerken.
      </p>
      <div className="flex gap-4 w-full max-w-fit">
        <Link
          href="/books/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nieuw boek toevoegen +
        </Link>
        <Link
          href="/books/archive"
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Archief bekijken
        </Link>
      </div>
      <BookList books={books} title="Actieve boeken">
        {(book: Book) => {
          const transactions = transactionsPerBook[book.id] || [];
          const balance = calculateBalance(transactions);
          return (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-lg shadow-2xl bg-gradient-to-r from-sky-400 to-blue-50 hover:from-sky-500 hover:to-blue-600 transition"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{book.name}</h3>
              </div>
              <div className="flex-none text-right">
                <strong>
                  <span className="text-sm mr-1">Balans:</span>
                </strong>
                <span
                  className={`text-xl font-bold ${
                    balance < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  €{" "}
                  {balance.toLocaleString("nl-NL", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </Link>
          );
        }}
      </BookList>
    </section>
  );
}
