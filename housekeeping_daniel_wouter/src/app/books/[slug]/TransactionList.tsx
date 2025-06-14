import TransactionItem from "../../dashboard/TransactionItem";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: { seconds: number };
}

interface Props {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: Props) {
  if (transactions.length === 0) {
    return <p className="text-gray-500">Geen transacties deze maand.</p>;
  }

  return (
    <ul className="space-y-2">
      {transactions.map((t) => (
        <TransactionItem key={t.id} transaction={t} />
      ))}
    </ul>
  );
}
