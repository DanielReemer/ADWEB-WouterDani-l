"use client";

import { useState } from "react";
import TransactionForm from "@/app/books/[slug]/TransactionForm";
import Transaction from "@/lib/collections/Transaction";
import {
  deleteTransaction,
  updateTransaction,
} from "@/services/transaction.service";
import { TransactionFormData } from "@/app/books/[slug]/TransactionForm";
import { useDraggable } from "@dnd-kit/core";

interface TransactionItemProps {
  transaction: Transaction;
  categories: { id: string; name: string }[];
}

export default function TransactionItem({
  transaction,
  categories,
}: TransactionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const dateString = transaction.date.toDate().toLocaleDateString();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: transaction.id,
    data: { transaction },
  });

  const handleDelete = async () => {
    const confirmed = confirm("Weet je zeker dat je deze transactie wilt verwijderen?");
    if (!confirmed) return;

    deleteTransaction(
      transaction.id
    ).catch((err) => {
      console.error("Fout bij verwijderen:", err);
      alert("Verwijderen mislukt.");
    });
  };

  const handleUpdate = async (updated: TransactionFormData) => {
    try {
      await updateTransaction(
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
    <div
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
      className="border p-3 rounded shadow-sm bg-white"
    >
      {isEditing ? (
        <>
          <TransactionForm
            onSave={handleUpdate}
            categories={categories}
            initialTransaction={{
              amount: transaction.amount,
              description: transaction.description,
              type: transaction.type,
              date: transaction.date,
              categoryId: transaction.categoryId ?? "",
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
        </>
      ) : (
        <div className="flex justify-between items-center gap-2">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-400 hover:text-gray-600 pr-2"
            title="Versleep"
          >
            ⠿
          </button>

          {/* Info */}
          <div className="flex-grow overflow-hidden">
            <div className="font-medium text-sm">{dateString}</div>
            <div className="text-sm text-gray-800 truncate">
              {transaction.description}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 text-sm whitespace-nowrap">
            <span>
              €{transaction.amount} ({transaction.type === "income" ? "⬆️" : "⬇️"})
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:underline"
              title="Bewerken"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:underline"
              title="Verwijderen"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
