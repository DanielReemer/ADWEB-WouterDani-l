"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import MonthSelector from "./MonthSelector";
import Statistics from "./Statistics";
import TransactionList from "./TransactionList"
import SkeletonTransactionList from "../ui/SkeletonTransactionList";
import TransactionForm from "./TransactionForm";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);



  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date.seconds * 1000);
    return d.getMonth() === selectedMonth;
  });

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
                {showForm ? "Annuleer" : "➕ Nieuwe transactie"}
            </button>
          {showForm && (
            <TransactionForm
                onSave={() => {
                setShowForm(false);
                setEditingTransaction(null);
                }}
            />
        )}
          <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} />
          <Statistics income={income} expense={expense} />
          <TransactionList transactions={filtered}/>
        </>
      )}
    </main>
  );
}
