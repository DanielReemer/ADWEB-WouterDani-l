import Transaction from "./Transaction";

export function filterTransactionsByMonth(transactions: Transaction[], selectedMonth: number, selectedYear: number) {
  return transactions.filter((t) => {
    const d = new Date(t.date.seconds * 1000);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });
}
