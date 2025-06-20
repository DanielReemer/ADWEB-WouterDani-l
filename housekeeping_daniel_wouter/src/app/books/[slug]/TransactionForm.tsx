"use client";

import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import Transaction from "@/lib/collections/Transaction";

export type TransactionFormData = Omit<
  Transaction,
  "id" | "userId" | "bookId"
> & {
  categoryId: string | null;
};

type TransactionFormProps = {
  onSave: (transaction: TransactionFormData) => Promise<void>;
  categories: { id: string; name: string }[];
  initialTransaction?: TransactionFormData;
  formTitle?: string;
  submitLabel?: string;
};

export default function TransactionForm({
  onSave,
  categories,
  initialTransaction,
  formTitle = "Nieuwe transactie",
  submitLabel = "Toevoegen",
}: TransactionFormProps) {
  const [amount, setAmount] = useState<number>(
    initialTransaction ? initialTransaction.amount : 0
  );
  const [description, setDescription] = useState(
    initialTransaction ? initialTransaction.description : ""
  );
  const [type, setType] = useState<"income" | "expense">(
    initialTransaction ? initialTransaction.type : "expense"
  );
  const [date, setDate] = useState<Date | null>(
    initialTransaction ? initialTransaction.date.toDate() : new Date()
  );
  const [categoryId, setCategoryId] = useState<string>(
    initialTransaction?.categoryId || ""
  );
  const [saving, setSaving] = useState(false);

  /** Synchroniseer bij openen in bewerk-modus */
  useEffect(() => {
    if (initialTransaction) {
      setAmount(initialTransaction.amount);
      setDescription(initialTransaction.description);
      setType(initialTransaction.type);
      setDate(initialTransaction.date.toDate());
      setCategoryId(initialTransaction.categoryId || "");
    }
  }, [initialTransaction]);


  const resetForm = () => {
    setAmount(0);
    setDescription("");
    setType("expense");
    setDate(new Date());
    setCategoryId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || amount <= 0) return alert("Voer een geldig bedrag in.");
    if (!date) return alert("Kies een geldige datum.");

    setSaving(true);

    const transaction: TransactionFormData = {
      amount,
      description,
      type,
      date: Timestamp.fromDate(date),
      categoryId: categoryId || null,
    };

    onSave(transaction)
      .then(() => !initialTransaction && resetForm())
      .catch(() => alert("Er is iets misgegaan bij het opslaan van de transactie."))
      .finally(() => setSaving(false));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 mb-6 border rounded shadow"
    >
      <h2 className="text-lg font-semibold mb-4">{formTitle}</h2>

      {/* Bedrag */}
      <label htmlFor="amount" className="block mb-2">
        Bedrag (€):
      </label>
      <input
        id="amount"
        type="number"
        value={amount === 0 ? "" : amount}
        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
        className="border p-2 w-full mb-4"
        required
        step="0.01"
        min="0.01"
      />

      {/* Datum */}
      <label htmlFor="date" className="block mb-2">
        Datum:
      </label>
      <input
        id="date"
        type="date"
        value={date ? date.toISOString().split("T")[0] : ""}
        onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : null)}
        className="border p-2 w-full mb-4"
      />

      {/* Beschrijving */}
      <label htmlFor="description" className="block mb-2">
        Beschrijving (optioneel):
      </label>
      <input
        id="description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      {/* Type */}
      <label htmlFor="type" className="block mb-2">
        Type:
      </label>
      <select
        id="type"
        value={type}
        onChange={(e) => setType(e.target.value as "income" | "expense")}
        className="border p-2 w-full mb-4"
      >
        <option value="expense">Uitgave</option>
        <option value="income">Inkomst</option>
      </select>

      {/* Categorie */}
      <label htmlFor="category" className="block mb-2">
        Categorie:
      </label>
      <select
        id="category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="border p-2 w-full mb-4"
      >
        <option value="">Geen categorie</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
        disabled={saving}
      >
        {saving ? "Opslaan..." : submitLabel}
      </button>
    </form>
  );
}
