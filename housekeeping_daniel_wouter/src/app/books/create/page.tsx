"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BookForm, { BookFormData } from "@/app/books/BookForm";
import { addBook } from "@/services/book.service";

export default function CreateBookPage() {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const router = useRouter();

  const initialForm: BookFormData = {
    name: "",
    description: "",
    errors: undefined,
  };

  const handleCreate = (data: BookFormData) => {
    setGlobalError(undefined);
    setLoading(true);
    addBook(data)
      .then(() => {
        router.push("/books");
      })
      .catch((err) => {
        console.error(err);
        setGlobalError("Er is iets misgegaan bij het aanmaken van het boek.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <section className="flex w-full bg-blue-300 rounded rounded-3xl shadow-2xl max-w-2xl flex-col items-center p-6 space-y-6">
      <BookForm
        initialData={initialForm}
        onSubmit={handleCreate}
        submitButtonLabel="Aanmaken"
        formHeading="Nieuw Boek Aanmaken"
        loading={loading}
        globalError={globalError}
      />
    </section>
  );
}
