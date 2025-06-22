"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import BookForm, { BookFormData } from "@/app/books/BookForm";
import { Book } from "@/lib/collections/Book";
import { listenToBook, updateBook } from "@/services/book.service";
import { archiveBook } from "@/services/bookArchive.service";
import Loading from "@/app/loading";
import { useRequireUser } from "@/lib/hooks/useRequireUser";

export default function EditBookPage() {
  const slug = useParams<{ slug: string }>().slug;
  const router = useRouter();
  const user = useRequireUser();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [archiving, setArchiving] = useState(false);
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
    if (!book || book.ownerId !== user.uid) {
      setGlobalError("Je hebt geen rechten om dit boek te bewerken.");
      return;
    }
    setLoading(true);

    try {
      await updateBook(book.id, {
        name: data.name,
        description: data.description,
      });
      router.push(`/books/${book.id}`);
    } catch {
      setGlobalError("Kon het boek niet updaten.");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!book || book.ownerId !== user.uid) return;
    setArchiving(true);
    setGlobalError(undefined);

    try {
      await archiveBook(book.id);
      router.push("/books");
    } catch {
      setGlobalError("Kon het boek niet archiveren.");
    } finally {
      setArchiving(false);
    }
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
    <section className="flex w-full bg-blue-300 rounded-3xl shadow-2xl max-w-2xl flex-col items-center p-6 space-y-6">
      <BookForm
        initialData={initialForm}
        onSubmit={handleUpdate}
        submitButtonLabel="Opslaan"
        formHeading="Boek Bewerken"
        loading={loading}
        globalError={globalError}
      />
      {book.ownerId === user.uid && (
        <div className="flex justify-center bg-white rounded-3xl shadow-2xl max-w-xl p-5 w-full mt-4">
          <button
            type="button"
            onClick={handleArchive}
            disabled={archiving || loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {archiving ? "Archiveren..." : "Archiveren"}
          </button>
        </div>
      )}
    </section>
  );
}
