"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Category } from "@/lib/collections/Category";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
} from "@/services/category.service";

export default function CategorySidebar() {
  const user = useRequireUser();
  const { slug } = useParams<{ slug: string }>(); // bookId

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState(0);

  // edit-state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editBudget, setEditBudget] = useState<number>(0);

  useEffect(() => {
    if (!slug) return;
    const unsub = getCategories(slug, setCategories);
    return () => unsub();
  }, [slug]);

  const handleAdd = async () => {
    if (!name || budget <= 0) return;
    await addCategory({ id: "", name, budget, bookId: slug });
    setName("");
    setBudget(0);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
  };

  const startEdit = (c: Category) => {
    setEditId(c.id!);
    setEditName(c.name);
    setEditBudget(c.budget);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditBudget(0);
  };

  const saveEdit = async () => {
    if (!editId || !editName || editBudget <= 0) return;
    await updateCategory(editId, { name: editName, budget: editBudget });
    cancelEdit();
  };

  return (
    <aside className="w-full md:w-80 bg-gray-50 p-4 border rounded shadow-sm h-fit">
      <h2 className="text-lg font-semibold mb-4">Categorieën</h2>

      {/* Toevoegen */}
      <div className="flex flex-col gap-2 mb-6">
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
          ➕ Toevoegen
        </button>
      </div>

      {/* Lijst */}
      <ul className="space-y-3">
        {categories.map((c) => {
          const isEditing = editId === c.id;
          return (
            <li
              key={c.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              {/* Weergave-modus */}
              {!isEditing && (
                <>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">€{c.budget}</p>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <button
                      onClick={() => startEdit(c)}
                      className="text-blue-600 hover:underline"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(c.id!)}
                      className="text-red-600 hover:underline"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}

              {/* Edit-modus */}
              {isEditing && (
                <div className="w-full flex flex-col gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border p-1 rounded"
                  />
                  <input
                    type="number"
                    value={editBudget}
                    onChange={(e) => setEditBudget(Number(e.target.value))}
                    className="border p-1 rounded"
                  />
                  <div className="flex gap-2 text-xs mt-1">
                    <button
                      onClick={saveEdit}
                      className="bg-green-600 text-white px-2 py-1 rounded"
                    >
                      ✔︎ Opslaan
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-600 hover:underline"
                    >
                      Annuleer
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
