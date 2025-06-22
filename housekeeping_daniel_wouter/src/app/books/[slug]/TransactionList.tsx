import { DndContext } from "@dnd-kit/core";
import { updateTransactionCategory } from "@/services/transaction.service";
import type Transaction from "@/lib/collections/Transaction";
import { Category } from "@/lib/collections/Category";
import TransactionCategory from "./TransactionCategory";
import { DragEndEvent } from "@dnd-kit/core";

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

export default function TransactionList({ transactions, categories }: Props) {

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const transactionId = active.id as string;
    const newCategoryId = over.id as string;
  
    if (active.data?.current?.transaction?.type === "income"){
      alert("Inkomsten mogen geen categorie hebben.");
      return;
    }

    const t = transactions.find((t) => t.id === transactionId);
    if (!t || t.categoryId === newCategoryId) return;
    await updateTransactionCategory(t, newCategoryId);
  };

  const grouped: Record<string, Transaction[]> = {};
  for (const t of transactions) {
    const key = t.categoryId || "uncategorized";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-wrap gap-4">
        {categories.map((cat) => (
          <TransactionCategory
            key={cat.id}
            category={cat}
            transactions={grouped[cat.id] || []}
            categories={categories}
          />
        ))}
        <TransactionCategory
          category={null}
          transactions={grouped["uncategorized"] || []}
          categories={categories}
        />
      </div>
    </DndContext>
  );
}
