"use client";
import BookList from "./BookList";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { listenToBooks, listenToSharedBooks } from "@/services/book.service";
import { inviteToShareBook } from "@/services/bookShare.service";
import { Book } from "@/lib/collections/Book";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { listenToTransactions } from "@/services/transaction.service";
import Transaction from "@/lib/Transaction";
import { calculateBalance } from "@/lib/utils/calculateBalance";
import ShareBookModal from "@/app/books/ShareBookModal";
import { motion, AnimatePresence } from "framer-motion";

type SharedBook = Book & { ownerId: string };

export default function BookPage() {
  const user = useRequireUser();
  const [books, setBooks] = useState<Book[]>([]);
  const [sharedBooks, setSharedBooks] = useState<SharedBook[]>([]);
  const [transactions, setTransactions] = useState<
    Record<string, Transaction[]>
  >({});
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareBook, setShareBook] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsubBooks = listenToBooks(user.uid, setBooks);
    const unsubShared = listenToSharedBooks(user.uid, setSharedBooks);
    return () => {
      unsubBooks();
      unsubShared();
    };
  }, [user.uid]);

  useEffect(() => {
    const allBooks = [...books, ...sharedBooks];
    const unsubscribes = allBooks.map((book) =>
      listenToTransactions(user.uid, book.id, (txs) =>
        setTransactions((prev) => ({ ...prev, [book.id]: txs }))
      )
    );
    return () => unsubscribes.forEach((unsub) => unsub && unsub());
  }, [user.uid, books, sharedBooks]);

  const openShareModal = (id: string, name: string) => {
    setShareBook({ id, name });
    setShareError(null);
    setShareSuccess(null);
    setShareModalOpen(true);
  };

  const closeShareModal = () => {
    setShareBook(null);
    setShareError(null);
    setShareSuccess(null);
    setShareModalOpen(false);
  };

  const handleShareSubmit = async (emails: string[]) => {
    setShareLoading(true);
    setShareError(null);
    setShareSuccess(null);
    try {
      await inviteToShareBook(user.uid, shareBook!.id, shareBook!.name, emails);
      setShareSuccess("Uitnodiging verstuurd!");
      setTimeout(closeShareModal, 1200);
    } catch (e: any) {
      setShareError(e.message || "Onbekende fout bij uitnodigen.");
    } finally {
      setShareLoading(false);
    }
  };

  const allBooks = useMemo(
    () => [
      ...books.map((b) => ({ ...b, shared: false, ownerId: user.uid })),
      ...sharedBooks.map((b) => ({ ...b, shared: true })),
    ],
    [books, sharedBooks, user.uid]
  );

  return (
    <section className="w-full h-full max-w-3xl flex flex-col items-center gap-6 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
      <header className="w-full flex flex-col items-center gap-1">
        <h2 className="text-3xl font-bold text-blue-600 text-center">
          Huishoudboekjes
        </h2>
        <p className="text-gray-500 text-center">
          Overzicht van jouw boeken en gedeelde boeken. Klik op een boek voor
          details of bewerking.
        </p>
      </header>
      <div className="flex gap-4 w-full justify-center">
        <Link
          href="/books/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Nieuw boek +
        </Link>
        <Link
          href="/books/archive"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Archief
        </Link>
      </div>
      <BookList books={allBooks} title="Actieve boeken">
        {(book: Book & { shared?: boolean; ownerId?: string }) => {
          const balance = calculateBalance(transactions[book.id] ?? []);
          return (
            <div className="w-full flex items-center gap-2" key={book.id}>
              <Link
                href={`/books/${book.id}`}
                className="flex flex-1 flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-lg shadow bg-gradient-to-r from-sky-400 to-blue-50 hover:from-sky-500 hover:to-blue-600"
                tabIndex={0}
                aria-label={`Ga naar boek ${book.name}`}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">
                    {book.name}
                    {book.shared && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded">
                        Gedeeld
                      </span>
                    )}
                  </h3>
                  {book.shared && book.ownerId !== user.uid && (
                    <div className="text-xs text-gray-500 truncate">
                      Eigenaar:{" "}
                      <span className="font-mono">{book.ownerId}</span>
                    </div>
                  )}
                </div>
                <div className="flex-none text-right">
                  <span className="text-sm mr-1">Balans:</span>
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
                  className="group px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition flex items-center"
                  onClick={() => openShareModal(book.id, book.name)}
                  aria-label={`Deel boek ${book.name}`}
                >
                  Delen
                </button>
              )}
            </div>
          );
        }}
      </BookList>
      <AnimatePresence>
        {shareModalOpen && (
          <motion.div
            key="share-modal"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.32, ease: [0.36, 0.66, 0.04, 1] },
            }}
            exit={{
              opacity: 0,
              y: 32,
              scale: 0.97,
              transition: { duration: 0.2, ease: [0.36, 0.66, 0.04, 1] },
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <ShareBookModal
              open
              onClose={closeShareModal}
              onSubmit={handleShareSubmit}
              loading={shareLoading}
              error={shareError}
              success={shareSuccess}
              bookName={shareBook?.name}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
