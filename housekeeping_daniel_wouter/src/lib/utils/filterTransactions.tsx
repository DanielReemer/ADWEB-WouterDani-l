import Transaction from "@/lib/collections/Transaction";

export function filterTransactionsByMonth(transactions: Transaction[], selectedMonth: number, selectedYear: number) {
  return transactions.filter((t) => {
    const d = new Date(t.date.seconds * 1000);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });
}

export function filterTransactionsByCategory(transactions: Transaction[], categoryId: string | null) {
  if (!categoryId) {
    return transactions;
  }
  return transactions.filter((t) => t.categoryId === categoryId);
}
