import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Category {
  id?: string;
  name: string;
  budget: number;
  userId: string;
  bookId: string;
  createdAt?: Date;
}

export function getCategories(
  userId: string,
  bookId: string,
  setCategories: (categories: Category[]) => void
) {
  const q = query(
    collection(db, "categories"),
    where("userId", "==", userId),
    where("bookId", "==", bookId)
  );

  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
    setCategories(categories);
  });
}

export function addCategory(category: Category) {
  return addDoc(collection(db, "categories"), {
    ...category,
    createdAt: new Date(),
  });
}

export function updateCategory(id: string, data: Partial<Category>) {
  return updateDoc(doc(db, "categories", id), data);
}

export function deleteCategory(id: string) {
  return deleteDoc(doc(db, "categories", id));
}
