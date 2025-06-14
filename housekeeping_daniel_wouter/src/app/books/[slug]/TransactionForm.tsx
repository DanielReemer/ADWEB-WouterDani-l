"use client";

import { useState, useEffect } from "react";
import Transaction from "@/lib/Transaction";
import { Timestamp } from "firebase/firestore";

export type TransactionFormData = Omit<Transaction, "id" | "userId" | "bookId">;

type TransactionFormProps = {
  onSave: (transaction: TransactionFormData) => Promise<void>;
  initialTransaction?: TransactionFormData;
  formTitle?: string;
  submitLabel?: string;
};

export default function TransactionForm({
  onSave,
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialTransaction) {
      setAmount(initialTransaction.amount);
      setDescription(initialTransaction.description);
      setType(initialTransaction.type);
      setDate(initialTransaction.date.toDate());
    }
  }, [initialTransaction]);

  const resetForm = () => {
    setAmount(0);
    setDescription("");
    setType("expense");
    setDate(new Date());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      alert("Voer een geldig bedrag in.");
      return;
    }
    if (!date) {
      alert("Kies een geldige datum.");
      return;
    }
    if (!type) {
      alert("Kies een type transactie.");
      return;
    }

    setSaving(true);
    const transaction: TransactionFormData = {
      amount,
      description,
      type,
      date: Timestamp.fromDate(date),
    };

    onSave(transaction)
      .then(() => !initialTransaction && resetForm())
      .catch(() => {
        alert("Er is iets misgegaan bij het opslaan van de transactie.");
      })
      .finally(() => setSaving(false));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 mb-6 border rounded shadow"
    >
      <h2 className="text-lg font-semibold mb-4">{formTitle}</h2>
      <label htmlFor="amount" className="block mb-2">
        Bedrag (€):
      </label>
      <input
        id="amount"
        type="number"
        value={amount === 0 ? "" : amount}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          setAmount(isNaN(val) ? 0 : val);
        }}
        className="border p-2 w-full mb-4"
        required
        step="0.01"
        min="0.01"
      />
      <label htmlFor="date" className="block mb-2">
        Datum:
      </label>
      <input
        id="date"
        type="date"
        value={date ? date.toISOString().split("T")[0] : ""}
        onChange={(e) => {
          setDate(e.target.value ? new Date(e.target.value) : null);
        }}
        className="border p-2 w-full mb-4"
      />
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
