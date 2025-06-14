"use client";

import { use, useState } from "react";
import MonthSelector from "@/app/books/[slug]/MonthSelector";
import Statistics from "@/app/books/[slug]/Statistics";
import TransactionList from "@/app/books/[slug]/TransactionList";
import SkeletonTransactionList from "@/app/ui/SkeletonTransactionList";
import TransactionForm from "@/app/books/[slug]/TransactionForm";
import { filterTransactionsByMonth } from "@/lib/filterTransactions";
import Transaction from "@/lib/Transaction";
import { TransactionFormData } from "@/app/books/[slug]/TransactionForm";

type BookTransactionsProps = {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  onSave: (transaction: TransactionFormData) => Promise<void>;
};

export default function BookTransactions({
  transactions,
  loading,
  error,
  onSave,
}: BookTransactionsProps) {
  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [showForm, setShowForm] = useState(false);

  const filtered = filterTransactionsByMonth(
    transactions,
    selectedDate.month,
    selectedDate.year
  );

  const income = filtered
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = filtered
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleSave = async (transaction: TransactionFormData) => {
    await onSave(transaction);
    setShowForm(false);
  };

  return (
    <div className="mt-10 border-t border-gray-200 pt-8">
      <h3 className="text-2xl font-semibold text-blue-600 mb-4">Transacties</h3>
      {loading && <SkeletonTransactionList />}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && (
        <>
          <button
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setShowForm((prev) => !prev)}
          >
            {showForm ? "Annuleer" : "Nieuwe transactie"}
          </button>
          {showForm && <TransactionForm onSave={handleSave} />}
          <MonthSelector
            selectedMonth={selectedDate.month}
            selectedYear={selectedDate.year}
            onChange={setSelectedDate}
          />
          <Statistics income={income} expense={expense} />
          <TransactionList transactions={filtered} />
        </>
      )}
    </div>
  );
}
