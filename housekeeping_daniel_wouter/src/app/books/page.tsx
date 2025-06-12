"use client";
import BookList from "./BookList";
import Link from "next/link";
import { listenToBooks } from "@/services/book.service";
import { Book } from "@/lib/collections/Book";

export default function BookPage() {
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

      <BookList listenFn={listenToBooks} title="Actieve boeken">
        {(book: Book) => (
          <Link
          key={book.id}
          href={`/books/${book.id}`}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-lg shadow-2xl bg-gradient-to-r from-sky-400 to-blue-50 hover:from-sky-500 hover:to-blue-600 transition"
        >
          {/* Titel */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{book.name}</h3>
          </div>

          {/* Balans */}
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
        </Link>
        )}
      </BookList>
    </section>
  );
}
