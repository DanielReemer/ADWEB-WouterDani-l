"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import {
  getCategories,
  addCategory,
  deleteCategory,
  Category,
} from "@/services/category.service";

export default function CategorySidebar() {
  const user = useRequireUser();
  const { slug } = useParams<{ slug: string }>(); // bookId
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    if (!slug) return;
    const unsub = getCategories(slug, setCategories);
    return () => unsub();
  }, [slug]);

  const handleAdd = async () => {
    if (!name || budget <= 0) return;
    await addCategory({ name, budget, bookId: slug });
    setName("");
    setBudget(0);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
  };

  return (
    <aside className="w-full md:w-80 bg-gray-50 p-4 border rounded shadow-sm h-fit">
      <h2 className="text-lg font-semibold mb-4">Categorieën</h2>

      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Categorie Naam"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Budget (€)"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="border p-2 rounded"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          ➕
        </button>
      </div>

      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-gray-500">€{c.budget}</p>
            </div>
            <button
              onClick={() => handleDelete(c.id!)}
              className="text-red-500 text-sm"
            >
              ✖
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
