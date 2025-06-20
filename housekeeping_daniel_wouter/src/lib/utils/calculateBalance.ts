import Transaction from "@/lib/Transaction";

export function calculateBalance(transactions: Transaction[]): number {
    return transactions.reduce((acc, transaction) => {
      return acc + (transaction.type === "income" ? transaction.amount : -transaction.amount);
    }
    , 0);
  }