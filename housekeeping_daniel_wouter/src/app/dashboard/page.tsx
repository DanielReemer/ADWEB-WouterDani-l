"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { filterTransactionsByMonth } from "../../lib/filterTransactions";
import MonthSelector from "./MonthSelector";
import Statistics from "./Statistics";
import TransactionList from "./TransactionList"
import SkeletonTransactionList from "../ui/SkeletonTransactionList";
import TransactionForm from "./TransactionForm";
import Transaction from "@/lib/Transaction";


export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);



  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            description: d.description,
            amount: d.amount,
            type: d.type,
            date: d.date,
          } as Transaction;
        });
        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Fout bij ophalen van transacties.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filtered = filterTransactionsByMonth(transactions, selectedDate.month, selectedDate.year);

  const income = filtered
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = filtered
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <main>
      <h1 className="text-3xl font-bold mb-6 text-center"> Mijn Huishoudboekje</h1>

      {loading && <SkeletonTransactionList/>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && (
        <>
            <button
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => setShowForm((prev) => !prev)}
            >
                {showForm ? "Annuleer" : "Nieuwe transactie"}
            </button>
          {showForm && (
            <TransactionForm
                onSave={() => {
                setShowForm(false);
                 }}
            />
        )}
          <MonthSelector
            selectedMonth={selectedDate.month}
            selectedYear={selectedDate.year}
            onChange={setSelectedDate}
          />
          <Statistics income={income} expense={expense} />
          <TransactionList transactions={filtered}/>
        </>
      )}
    </main>
  );
}
