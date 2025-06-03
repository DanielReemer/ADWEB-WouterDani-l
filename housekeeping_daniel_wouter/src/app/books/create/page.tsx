"use client";
import { Book } from "@/lib/collections/Book";
import { addBook } from "@/services/book.service";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BookFormData extends Omit<Book, "id" | "balance"> {
  errors?: {
    name?: string;
    description?: string;
  };
}

export default function CreateBookPage() {
  const initialState: BookFormData = {
    name: "",
    description: "",
    errors: undefined,
  };

  const [form, setForm] = useState<BookFormData>(initialState);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);

  const validateForm = (form: BookFormData) => {
    const errors: BookFormData["errors"] = {};
    if (!form.name) {
      errors.name = "Naam is verplicht.";
    } else if (form.name.length < 3) {
      errors.name = "Naam moet minimaal 3 tekens lang zijn.";
    } else if (form.name.length > 50) {
      errors.name = "Naam mag maximaal 50 tekens lang zijn.";
    }
    if (form.description && form.description.length > 200) {
      errors.description = "Beschrijving mag maximaal 200 tekens lang zijn.";
    }
    return errors;
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setGlobalError(undefined);
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: undefined,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    const errors = validateForm(form);
    if (errors.name || errors.description) {
      setForm((prev) => ({ ...prev, errors }));
      setLoading(false);
      return;
    }
  
    setForm((prev) => ({ ...prev, errors: undefined }));
  
    addBook(form as Book)
      .then(() => {
        setForm(initialState);
        router.push("/books");
      })
      .catch((error: any) => {
        setGlobalError(
          "Er is een fout opgetreden bij het aanmaken van het boek. Probeer het later opnieuw."
        );
        console.error("Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <section className="flex align-center justify-center max-w-3xl p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full min-w-fit max-w-lg max-h-fit bg-white rounded-3xl shadow-2xl p-10 space-y-7 border border-gray-100"
        style={{
          boxShadow:
            "0 10px 30px 0 rgba(160, 174, 192, 0.2), 0 2px 4px 0 rgba(160, 174, 192, 0.19)",
        }}
      >
        <h1 className="text-3xl font-extrabold text-center text-blue-600 mb-8 tracking-tight">
          Nieuw Boek Aanmaken
        </h1>

        {/* Global error */}
        {globalError && (
          <div className="mb-4">
            <div className="w-full text-center px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-semibold shadow-sm">
              {globalError}
            </div>
          </div>
        )}

        {/* Name */}
        <div>
          <label
            className="block font-medium text-gray-700 mb-2"
            htmlFor="name"
          >
            Naam <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Voer de naam van het boek in"
            className={`w-full px-4 py-3 border text-lg rounded-lg bg-gray-50 outline-none transition focus:ring-2 ${
              form.errors?.name
                ? "border-red-300 focus:ring-red-200"
                : "border-gray-200 focus:ring-blue-200"
            }`}
            value={form.name}
            onChange={handleChange}
            autoComplete="off"
            disabled={loading}
          />
          {form.errors?.name && (
            <p className="text-red-500 text-sm mt-1">{form.errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            className="block font-medium text-gray-700 mb-2"
            htmlFor="description"
          >
            Omschrijving
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Optioneel: omschrijf het boek"
            className={`w-full px-4 py-3 border text-lg rounded-lg bg-gray-50 outline-none transition focus:ring-2 resize-none ${
              form.errors?.description
                ? "border-red-300 focus:ring-red-200"
                : "border-gray-200 focus:ring-blue-200"
            }`}
            value={form.description}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            disabled={loading}
          />
          <div className="flex justify-between text-xs mt-1">
            <span
              className={
                form.errors?.description ? "text-red-500" : "text-gray-400"
              }
            >
              {form.errors?.description ? form.errors.description : ""}
            </span>
            <span className="text-gray-300">
              {form.description?.length || 0}/500
            </span>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:cursor-pointer hover:to-sky-500 text-white font-semibold text-lg py-3 rounded-xl shadow-lg transition duration-150 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Bezig..." : "Aanmaken"}
        </button>
      </form>
    </section>
  );
}
