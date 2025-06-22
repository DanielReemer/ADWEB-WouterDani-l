"use client";

import { useDroppable } from "@dnd-kit/core";
import { Category } from "@/lib/collections/Category";
import Transaction from "@/lib/collections/Transaction";
import TransactionItem from "./TransactionItem";

interface Props {
  category: Category | null;
  transactions: Transaction[];
  categories: Category[];
}

export default function TransactionCategory({
  category,
  transactions,
  categories,
}: Props) {
  const id = category?.id || "uncategorized";
  const { setNodeRef, isOver } = useDroppable({ id });

  const totalSpent = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const budget = category?.budget || 0;
  const budgetStatus =
    totalSpent > budget
      ? "text-red-600"
      : totalSpent / budget > 0.8
      ? "text-orange-500"
      : "text-green-600";

  return (
    <div
      ref={setNodeRef}
      className={`p-4 border rounded w-80 min-h-20 transition-colors ${
        isOver ? "bg-blue-100" : "bg-white"
      }`}
    >
      <h3 className="font-semibold text-lg mb-1">
        {category?.name || "Zonder categorie"}
      </h3>
      {category && (
        <p className={`text-sm ${budgetStatus}`}>
          Besteed: €{totalSpent} / €{budget}
        </p>
      )}
      <div className="space-y-2 mt-2">
        {transactions.map((t) => (
          <TransactionItem
            key={t.id}
            transaction={t}
            categories={categories}
          />
        ))}
      </div>
    </div>
  );
}
