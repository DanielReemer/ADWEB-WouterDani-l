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

export default function TransactionItem({ transaction, categories }: TransactionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const dateString = transaction.date.toDate().toLocaleDateString();
  const [categoryName, setCategoryName] = useState<string>();

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

 useEffect(() => {
    const category = categories.find(
      (cat) => cat.id === transaction.categoryId
    );
    setCategoryName(category ? "- " + category.name : "");
  }, [categories, transaction.categoryId]);

  return (
    <li className="border p-3 rounded shadow-sm">
      {isEditing ? (
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
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <strong>{dateString}</strong> - {transaction.description} {categoryName}
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
