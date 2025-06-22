"use client";

import { useEffect, useState } from "react";
import BookList from "@/app/books/BookList";
import Link from "next/link";
import { listenToArchivedBooks } from "@/services/archivedBook.service";
import { restoreBook } from "@/services/bookArchive.service";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { Book } from "@/lib/collections/Book";

export default function ArchivedBooksPage() {
  const user = useRequireUser();
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const unsubscribe = listenToArchivedBooks(user.uid, (books) =>
      setBooks(books || [])
    );
    return () => unsubscribe();
  }, [user.uid]);

  async function handleRestore(book: Book) {
    try {
      await restoreBook(user.uid, book.id);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <section className="w-full h-full max-w-3xl flex flex-col justify-center items-center gap-6 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
      <div className="flex items-center w-full">
        <h2 className="text-3xl font-bold text-blue-600 flex-1 text-center">
          Gearchiveerde boekjes
        </h2>
      </div>
      <p className="text-gray-500 mb-6 text-center">
        Hier zie je alle huishoudboekjes die je hebt gearchiveerd.
      </p>
      <Link
        href="/books"
        className="max-w-fit px-4 md:self-start py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
      >
        Terug naar actieve boeken
      </Link>
      <BookList books={books} title="Gearchiveerde boekjes">
        {(book) => (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-lg shadow-2xl bg-gradient-to-r from-sky-400 to-blue-50 hover:from-sky-500 hover:to-blue-600 transition">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{book.name}</h3>
            </div>
            {typeof book.balance === "number" && (
              <div className="flex-none text-right">
                <strong>
                  <span className="text-sm mr-1">Balans:</span>
                </strong>
                <span
                  className={`text-xl font-bold ${
                    book.balance < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  €{" "}
                  {book.balance.toLocaleString("nl-NL", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => handleRestore(book)}
              className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:cursor-pointer hover:bg-green-700 transition"
            >
              Terugzetten
            </button>
          </div>
        )}
      </BookList>
    </section>
  );
}
