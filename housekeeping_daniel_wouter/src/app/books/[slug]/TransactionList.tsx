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

  const transactionsByCategory: { [key: string]: Transaction[] } = {};

  // Initialize category buckets
  categories.forEach((cat) => {
    transactionsByCategory[cat.id] = [];
  });

  // Separate for uncategorized
  transactionsByCategory["uncategorized"] = [];

  // Group transactions
  for (const transaction of transactions) {
    const categoryId = transaction.categoryId;
    if (categoryId && transactionsByCategory[categoryId]) {
      transactionsByCategory[categoryId].push(transaction);
    } else {
      transactionsByCategory["uncategorized"].push(transaction);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Render each category column */}
      {categories.map((cat) => (
        <div key={cat.id}>
          <h4 className="text-md font-semibold mb-2">{cat.name}</h4>
          {transactionsByCategory[cat.id].length > 0 ? (
            <ul className="space-y-2">
              {transactionsByCategory[cat.id].map((t) => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  categories={categories}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Geen transacties</p>
          )}
        </div>
      ))}

      {/* Uncategorized transactions */}
      {transactionsByCategory["uncategorized"].length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-2">Zonder categorie</h4>
          <ul className="space-y-2">
            {transactionsByCategory["uncategorized"].map((t) => (
              <TransactionItem
                key={t.id}
                transaction={t}
                categories={categories}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
