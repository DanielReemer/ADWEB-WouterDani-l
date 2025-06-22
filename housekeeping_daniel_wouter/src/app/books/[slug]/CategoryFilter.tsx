"use client";

import { Category } from "@/lib/collections/Category";

interface Props {
  categories: Category[];
  selectedCategory: string | null;
  onChange: (categoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onChange,
}: Props) {
  return (
    <div className="mb-4">
      <label htmlFor="category-filter" className="block mb-2 text-sm text-gray-700">
        Filter op categorie:
      </label>
      <select
        id="category-filter"
        className="border border-gray-300 rounded p-2 w-full"
        value={selectedCategory ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          onChange(value === "" ? null : value);
        }}
      >
        <option value="">Alle categorieën</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
