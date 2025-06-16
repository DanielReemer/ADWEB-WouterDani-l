"use client";

import { useState } from "react";
import TransactionForm from "@/app/books/[slug]/TransactionForm";
import Transaction from "@/lib/Transaction";
import {
  deleteTransaction,
  updateTransaction,
} from "@/services/transaction.service";
import { TransactionFormData } from "@/app/books/[slug]/TransactionForm";

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const dateString = transaction.date.toDate().toLocaleDateString();

  const handleDelete = async () => {
    const confirmed = confirm(
      "Weet je zeker dat je deze transactie wilt verwijderen?"
    );
    if (!confirmed) return;

    deleteTransaction(
      transaction.userId,
      transaction.bookId,
      transaction.id
    ).catch((err) => {
      console.error("Fout bij verwijderen:", err);
      alert("Verwijderen mislukt.");
    });
  };

  const handleUpdate = async (updated: TransactionFormData) => {
    try {
      await updateTransaction(
        transaction.userId,
        transaction.bookId,
        transaction.id,
        updated
      );
      setIsEditing(false);
    } catch (err) {
      console.error("Fout bij updaten:", err);
      alert("Update mislukt.");
    }
  };

  return (
    <li className="border p-3 rounded shadow-sm">
      {isEditing ? (
        <TransactionForm
          onSave={handleUpdate}
          initialTransaction={{
            amount: transaction.amount,
            description: transaction.description,
            type: transaction.type,
            date: transaction.date,
          }}
          formTitle="Transactie bewerken"
          submitLabel="Opslaan"
        />
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <strong>{dateString}</strong> – {transaction.description}
          </div>
          <div className="flex items-center gap-4">
            <span>
              €{transaction.amount} (
              {transaction.type === "income" ? "⬆️" : "⬇️"})
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:underline text-sm"
            >
              ✏️ Bewerken
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:underline text-sm"
            >
              🗑️ Verwijder
            </button>
          </div>
        </div>
      )}
      {isEditing && (
        <button
          onClick={() => setIsEditing(false)}
          className="mt-2 text-gray-600 hover:underline text-sm"
          type="button"
        >
          Annuleer
        </button>
      )}
    </li>
  );
}
