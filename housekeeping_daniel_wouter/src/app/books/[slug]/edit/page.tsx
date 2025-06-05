// app/books/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import BookForm, { BookFormData } from "@/app/books/BookForm";
import { Book } from "@/lib/collections/Book";
import { listenToBook, updateBook } from "@/services/book.service";
import Loading from "@/app/loading";

export default function EditBookPage() {
  const slug = useParams<{ slug: string }>().slug;
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    const unsubscribe = listenToBook(slug, (book) => {
      if (!book) {
        setGlobalError("Boek niet gevonden.");
      } else {
        setBook(book);
      }
    });
    return () => unsubscribe();
  }, [slug]);

  const handleUpdate = async (data: BookFormData) => {
    if (!book) return;
    setLoading(true);

    updateBook(book.id, {
      name: data.name,
      description: data.description,
    })
      .then(() => {
        router.push(`/books/${book.id}`);
      })
      .catch((err) => {
        console.error(err);
        setGlobalError("Kon het boek niet updaten.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!book) {
    return globalError ? (
      <div className="text-center mt-20 text-red-500">{globalError}</div>
    ) : (
      <Loading />
    );
  }

  const initialForm: BookFormData = {
    name: book.name,
    description: book.description ?? "",
    errors: undefined,
  };

  return (
    <section className="flex w-full justify-center p-6">
      <BookForm
        initialData={initialForm}
        onSubmit={handleUpdate}
        submitButtonLabel="Opslaan"
        loading={loading}
        globalError={globalError}
      />
    </section>
  );
}
