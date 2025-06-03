"use client";
import { Book } from "@/lib/collections/Book";
import { listenToBooks } from "@/services/book.service";
import { useEffect } from "react";
import { useLoading } from "@/lib/hooks/useLoading";
import Link from "next/link";
import Loading from "@/app/loading";

export default function BookList() {
  const { loading, data: books, setLoaded, reset } = useLoading<Book[]>();

  useEffect(() => {
    reset();
    const unsubscribe = listenToBooks((books: Book[]) => {
      setLoaded(books);
    });

    return () => {
      unsubscribe();
    };
  }, [setLoaded, reset]);

  if (loading) {
    return (
      <div className="w-full h-full max-w-md bg-white rounded-xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-2">
          Boekenlijst
        </h2>
        <p className="text-center text-gray-500 mb-8">Laden...</p>
        <ul className="space-y-4">
          {[...Array(5)].map((_, idx) => (
            <li key={idx} className="p-4 rounded bg-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!books || !books.length) {
    return (
      <div>
        <p className="text-center text-gray-500 mb-8">Geen boeken gevonden.</p>
      </div>
    );
  }

  return (
    <section>
      <ul className="space-y-6">
        {books.map((book) => (
          <li
            key={book.id}
            className="rounded-lg border border-gray-100 shadow hover:shadow-lg transition bg-blue-50 hover:bg-blue-100"
          >
            <Link href={`/books/${book.id}`} className="block">
              <h3 className="text-lg font-semibold p-4 text-blue-800 mb-1 text-center">
                {book.name}
              </h3>
              {book.description && (
                <p className="text-gray-600 text-center mb-2">
                  {book.description}
                </p>
              )}
              {typeof book.balance === "number" && (
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-500 mr-1">Balans:</span>
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
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
