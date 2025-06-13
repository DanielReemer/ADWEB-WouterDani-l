"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useLoading } from "@/lib/hooks/useLoading";
import { listenToBook } from "@/services/book.service";
import { Book } from "@/lib/collections/Book";
import Loading from "@/app/loading";
import Link from "next/link";
import { useRequireUser } from "@/lib/hooks/useRequireUser";

export default function BookPage() {
  const { loading, data: book, setLoaded, reset } = useLoading<Book>();
  const { slug } = useParams<{ slug: string }>();
  const user = useRequireUser();

  useEffect(() => {
    reset();
    const unsubscribe = listenToBook(user.uid, slug, (book: Book | undefined) => {
      setLoaded(book);
    });

    return () => {
      unsubscribe();
    };
  }, [user.uid, slug, setLoaded, reset]);

  if (loading) {
    return <Loading />;
  }

  if (!book) {
    return (
      <div className="p-10 flex flex-col items-center gap-4 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700">
          Geen gegevens gevonden
        </h2>
        <p className="text-gray-400 text-base">
          We kunnen het gevraagde boek helaas niet vinden.
          <br />
          Probeer het opnieuw of zoek naar een ander boek.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-xl flex flex-col gap-4 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
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
    </div>
  );
}