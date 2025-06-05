"use client";
import BookList from "./BookList";
import Link from "next/link";

export default function BookPage() {
  return (
    <section className="w-full h-full max-w-3xl flex flex-col justify-center items-center gap-4 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold text-blue-600 flex-1 text-center">
          Huishoudboekjes
        </h2>
      </div>
      <p className="text-gray-500 mb-4 text-center">
        Hier vind je een overzicht van al jouw boeken. Klik op een boek om de
        details te bekijken of om het te bewerken.
      </p>
      <Link
        href="/books/create"
        className="max-w-fit px-4 md:self-start py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Nieuw boek toevoegen +
      </Link>
      <BookList />
    </section>
  );
}
