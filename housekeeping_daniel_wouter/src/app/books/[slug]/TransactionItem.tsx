"use client";

import { useEffect, useState } from "react";
import TransactionForm from "@/app/books/[slug]/TransactionForm";
import Transaction from "@/lib/collections/Transaction";
import {
  deleteTransaction,
  updateTransaction,
} from "@/services/transaction.service";
import { TransactionFormData } from "@/app/books/[slug]/TransactionForm";

interface TransactionItemProps {
  transaction: Transaction;
  categories: { id: string; name: string }[];
}

export default function TransactionItem({
  transaction,
  categories,
}: TransactionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [categoryName, setCategoryName] = useState<string>("Zonder categorie");

  useEffect(() => {
    const category = categories.find(
      (cat) => cat.id === transaction.categoryId
    );
    setCategoryName(category ? category.name : "Zonder categorie");
  }, [categories, transaction.categoryId]);

  const handleDelete = async () => {
    const confirmed = confirm("Weet je zeker dat je deze transactie wilt verwijderen?");
    if (!confirmed) return;

    try {
      await deleteTransaction(transaction.userId, transaction.bookId, transaction.id);
    } catch (err) {
      console.error("Fout bij verwijderen:", err);
      alert("Verwijderen mislukt.");
    }
  };

  const handleUpdate = async (updated: TransactionFormData) => {
    try {
      await updateTransaction(transaction.userId, transaction.bookId, transaction.id, updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Fout bij updaten:", err);
      alert("Update mislukt.");
    }
  };

  if (isEditing) {
    return (
      <li className="border p-3 rounded shadow-sm">
        <TransactionForm
          onSave={handleUpdate}
          categories={categories}
          initialTransaction={{
            amount: transaction.amount,
            description: transaction.description,
            type: transaction.type,
            date: transaction.date,
            categoryId: transaction.categoryId,
          }}
          formTitle="Transactie bewerken"
          submitLabel="Opslaan"
        />
        <button
          onClick={() => setIsEditing(false)}
          className="mt-2 text-gray-600 hover:underline text-sm"
          type="button"
        >
          Annuleer
        </button>
      </li>
    );
  }

  return (
    <li className="border p-3 rounded shadow-sm bg-white hover:bg-gray-50 transition">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">
            {transaction.date.toDate().toLocaleDateString("nl-NL", {
              month: "2-digit",
              day: "2-digit",
            })}
            </span>
            <div className="break-words font-medium max-w-[130px]">
              {transaction.description || ""}
            </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <span
            className={`font-semibold ${
              transaction.type === "income" ? "text-green-600" : "text-red-600"
            }`}
          >
            {transaction.type === "income" ? "⬆️" : "⬇️"} €{transaction.amount.toFixed(2)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:scale-110 transition"
              title="Bewerken"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:scale-110 transition"
              title="Verwijderen"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
