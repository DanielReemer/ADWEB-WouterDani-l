"use client";

import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: { seconds: number };
}

export default function TransactionItem({ transaction }: { transaction: Transaction }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    date: new Date(transaction.date.seconds * 1000).toISOString().split("T")[0],
  });

  const date = new Date(transaction.date.seconds * 1000).toLocaleDateString();

  const handleDelete = async () => {
    const confirmed = confirm("Weet je zeker dat je deze transactie wilt verwijderen?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "transactions", transaction.id));
    } catch (err) {
      console.error("Fout bij verwijderen:", err);
      alert("Verwijderen mislukt.");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, "transactions", transaction.id), {
        ...editValues,
        date: new Date(editValues.date),
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Fout bij updaten:", err);
      alert("Update mislukt.");
    }
  };

  return (
    <li className="border p-3 rounded shadow-sm">
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editValues.description}
            onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
            className="border p-2 w-full"
          />
          <input
            type="date"
            value={editValues.date}
            onChange={(e) => setEditValues({ ...editValues, date: e.target.value })}
            className="border p-2 w-full"
          />
          <input
            type="number"
            value={editValues.amount}
            onChange={(e) => setEditValues({ ...editValues, amount: parseFloat(e.target.value) })}
            className="border p-2 w-full"
          />
          <select
            value={editValues.type}
            onChange={(e) => setEditValues({ ...editValues, type: e.target.value as "income" | "expense" })}
            className="border p-2 w-full"
          >
            <option value="expense">Uitgave</option>
            <option value="income">Inkomst</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleUpdate} className="bg-green-600 text-white px-3 py-1 rounded">
              ✅ Opslaan
            </button>
            <button onClick={() => setIsEditing(false)} className="text-gray-600 hover:underline">
              Annuleer
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <strong>{date}</strong> – {transaction.description}
          </div>
          <div className="flex items-center gap-4">
            <span>
              €{transaction.amount} ({transaction.type === "income" ? "⬆️" : "⬇️"})
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
    </li>
  );
}
