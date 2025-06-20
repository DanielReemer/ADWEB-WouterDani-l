"use client";
import BookList from "./BookList";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listenToBooks, listenToSharedBooks } from "@/services/book.service";
import { inviteToShareBook } from "@/services/bookShare.service";
import { Book } from "@/lib/collections/Book";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { listenToTransactions } from "@/services/transaction.service";
import Transaction from "@/lib/Transaction";
import { calculateBalance } from "@/lib/utils/calculateBalance";
import ShareBookModal from "@/app/books/ShareBookModal";

type SharedBook = Book & { ownerId: string };

export default function BookPage() {
  const user = useRequireUser();
  const [books, setBooks] = useState<Book[]>([]);
  const [sharedBooks, setSharedBooks] = useState<SharedBook[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [transactionsPerBook, setTransactionsPerBook] = useState<
    Record<string, Transaction[]>
  >({});
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareBookId, setShareBookId] = useState<string | null>(null);
  const [shareBookName, setShareBookName] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenToBooks(user.uid, setBooks);
    const unsubscribeShared = listenToSharedBooks(user.uid, setSharedBooks);
    return () => {
      unsubscribe();
      unsubscribeShared();
    };
  }, [user.uid]);

  useEffect(() => {
    const allBookIds = [...books, ...sharedBooks].map((book) => book.id);
    const unsubscribes = allBookIds.map((bookId) =>
      listenToTransactions(user.uid, bookId, (transactions) =>
        setAllTransactions((prev) => [
          ...prev.filter((t) => t.bookId !== bookId),
          ...transactions,
        ])
      )
    );
    return () => unsubscribes.forEach((unsub) => unsub && unsub());
  }, [user.uid, books, sharedBooks]);

  useEffect(() => {
    const transactionsMap: Record<string, Transaction[]> = {};
    allTransactions.forEach((transaction) => {
      if (!transactionsMap[transaction.bookId])
        transactionsMap[transaction.bookId] = [];
      transactionsMap[transaction.bookId].push(transaction);
    });
    setTransactionsPerBook(transactionsMap);
  }, [allTransactions]);

  const openShareModal = (bookId: string, bookName: string) => {
    setShareBookId(bookId);
    setShareBookName(bookName);
    setShareError(null);
    setShareModalOpen(true);
  };

  const closeShareModal = () => {
    setShareBookId(null);
    setShareBookName(null);
    setShareError(null);
    setShareModalOpen(false);
  };

  const handleShareSubmit = async (emails: string[]) => {
    setShareLoading(true);
    setShareError(null);
    try {
      await inviteToShareBook(user.uid, shareBookId!, shareBookName!, emails);
      closeShareModal();
    } catch (e: any) {
      setShareError(e.message || "Onbekende fout bij uitnodigen.");
    } finally {
      setShareLoading(false);
    }
  };

  const allBooks = [
    ...books.map((b) => ({ ...b, shared: false, ownerId: user.uid })),
    ...sharedBooks.map((b) => ({ ...b, shared: true })),
  ];

  return (
    <section className="w-full h-full max-w-3xl flex flex-col justify-center items-center gap-4 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
      <div className="flex items-center w-full">
        <h2 className="text-3xl font-bold text-blue-600 flex-1 text-center">
          Huishoudboekjes
        </h2>
      </div>
      <p className="text-gray-500 mb-4 text-center">
        Hier vind je een overzicht van al jouw boeken en gedeelde boeken. Klik
        op een boek om de details te bekijken of om het te bewerken.
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
      <BookList books={allBooks} title="Actieve boeken">
        {(book: Book & { shared?: boolean; ownerId?: string }) => {
          const transactions = transactionsPerBook[book.id] || [];
          const balance = calculateBalance(transactions);
          return (
            <div className="w-full flex items-center gap-2" key={book.id}>
              <Link
                href={`/books/${book.id}`}
                className="flex flex-1 flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-lg shadow-2xl bg-gradient-to-r from-sky-400 to-blue-50 hover:from-sky-500 hover:to-blue-600 transition"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {book.name}
                    {book.shared && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded">
                        Gedeeld
                      </span>
                    )}
                  </h3>
                  {book.shared && book.ownerId !== user.uid && (
                    <div className="text-xs text-gray-500">
                      Eigenaar: {book.ownerId}
                    </div>
                  )}
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
              {!book.shared && (
                <button
                  type="button"
                  className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                  onClick={() => openShareModal(book.id, book.name)}
                  title="Deel dit boek met een andere gebruiker"
                >
                  Delen
                </button>
              )}
            </div>
          );
        }}
      </BookList>
      <ShareBookModal
        open={shareModalOpen}
        onClose={closeShareModal}
        onSubmit={handleShareSubmit}
        loading={shareLoading}
        error={shareError}
      />
    </section>
  );
}
