"use client";

import Link from "next/link";
import { Book } from "@/lib/collections/Book";

type BookHeaderProps = {
  book: Book;
};

export default function BookDetails({ book }: BookHeaderProps) {
  return (
    <>
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-2">
        {book.name}
      </h2>
      <Link
        href={`/books/${book.id}/edit`}
        className="max-w-fit px-4 self-center sm:self-start py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Bewerk dit boek
      </Link>
      <div className="space-y-6">
        {book.description && (
          <div>
            <div className="text-sm text-gray-500 mb-1">Beschrijving</div>
            <div className="text-gray-700">{book.description}</div>
          </div>
        )}
        {typeof book.balance === "number" && (
          <div>
            <div className="text-sm text-gray-500 mb-1">Balans</div>
            <div
              className={`text-2xl font-bold ${
                book.balance < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              €{" "}
              {book.balance.toLocaleString("nl-NL", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
