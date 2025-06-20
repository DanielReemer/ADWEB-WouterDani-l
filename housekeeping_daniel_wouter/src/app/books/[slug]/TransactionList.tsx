import TransactionItem from "@/app/books/[slug]/TransactionItem";
import Transaction from "@/lib/collections/Transaction";

interface Props {
  transactions: Transaction[];
  categories: { id: string; name: string }[];
}

export default function TransactionList({ transactions, categories }: Props) {
  if (transactions.length === 0) {
    return <p className="text-gray-500">Geen transacties deze maand.</p>;
  }

  return (
    <ul className="space-y-2">
      {transactions.map((t) => (
        <TransactionItem key={t.id} transaction={t} categories={categories} />
      ))}
    </ul>
  );
}
