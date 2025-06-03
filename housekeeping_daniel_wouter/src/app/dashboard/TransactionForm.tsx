"use client";

import { useState } from "react";
import { addDoc, updateDoc, collection, Firestore } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function TransactionForm({ onSave }: { onSave?: () => void }) {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      alert("Voer een geldig bedrag in.");
      return;
    }

    setSaving(true);

    const newTransaction = {
      amount,
      description,
      type,
      date,
    }

    try {
      await addDoc(collection(db, "transactions"), newTransaction);
      
      if (onSave) onSave();
    } catch (err) {
      console.error("Fout bij opslaan:", err);
      alert("Er is iets misgegaan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 mb-6 border rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Nieuwe transactie</h2>

      <label htmlFor="amount" className="block mb-2">Bedrag (€):</label>
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

      <label htmlFor="date" className="block mb-2">Datum:</label>
      <input
        id="date"
        type="date"
        value={date.toISOString().split("T")[0]} // Format YYYY-MM-DD
        onChange={(e) => setDate(new Date(e.target.value))}
        className="border p-2 w-full mb-4"
      />

      <label htmlFor="description" className="block mb-2">Beschrijving (optioneel):</label>
      <input
        id="description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      <label htmlFor="type" className="block mb-2">Type:</label>
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
        {saving ? "Opslaan..." : "Toevoegen"}
      </button>
    </form>
  );
}