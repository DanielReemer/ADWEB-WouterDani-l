import * as categoryService from "@/services/category.service";
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
import { Category } from "@/lib/collections/Category";

jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  updateDoc: jest.fn(),
  where: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("category.service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getCategories sets categories from snapshot", () => {
    const mockSetCategories = jest.fn();
    const mockDocs = [
      { id: "cat1", data: () => ({ name: "Food", budget: 100, bookId: "book1" }) },
      { id: "cat2", data: () => ({ name: "Transport", budget: 50, bookId: "book1" }) },
    ];
    const mockSnapshot = { docs: mockDocs };
    (onSnapshot as jest.Mock).mockImplementation((q, cb) => {
      cb(mockSnapshot);
      return "unsubscribe";
    });
    (collection as jest.Mock).mockReturnValue("categories-collection");
    (query as jest.Mock).mockReturnValue("query-object");
    (where as jest.Mock).mockReturnValue("where-object");

    const unsubscribe = categoryService.getCategories("book1", mockSetCategories);

    expect(collection).toHaveBeenCalledWith(db, "categories");
    expect(where).toHaveBeenCalledWith("bookId", "==", "book1");
    expect(query).toHaveBeenCalled();
    expect(onSnapshot).toHaveBeenCalled();
    expect(mockSetCategories).toHaveBeenCalledWith([
      { id: "cat1", name: "Food", budget: 100, bookId: "book1" },
      { id: "cat2", name: "Transport", budget: 50, bookId: "book1" },
    ]);
    expect(unsubscribe).toBe("unsubscribe");
  });

  it("addCategory calls addDoc with correct data", async () => {
    (collection as jest.Mock).mockReturnValue("categories-collection");
    (addDoc as jest.Mock).mockResolvedValue("new-category");
    const category: Category = { id: "cat3", name: "Health", budget: 200, bookId: "book1" };
    const result = await categoryService.addCategory(category);
    expect(collection).toHaveBeenCalledWith(db, "categories");
    expect(addDoc).toHaveBeenCalledWith("categories-collection", {
      name: "Health",
      budget: 200,
      bookId: "book1",
    });
    expect(result).toBe("new-category");
  });

  it("updateCategory calls updateDoc with correct arguments", async () => {
    (doc as jest.Mock).mockReturnValue("category-doc");
    (updateDoc as jest.Mock).mockResolvedValue("updated-category");
    const result = await categoryService.updateCategory("cat1", { name: "Groceries" });
    expect(doc).toHaveBeenCalledWith(db, "categories", "cat1");
    expect(updateDoc).toHaveBeenCalledWith("category-doc", { name: "Groceries" });
    expect(result).toBe("updated-category");
  });

  it("deleteCategory calls deleteDoc with correct arguments", async () => {
    (doc as jest.Mock).mockReturnValue("category-doc");
    (deleteDoc as jest.Mock).mockResolvedValue("deleted-category");
    const result = await categoryService.deleteCategory("cat1");
    expect(doc).toHaveBeenCalledWith(db, "categories", "cat1");
    expect(deleteDoc).toHaveBeenCalledWith("category-doc");
    expect(result).toBe("deleted-category");
  });
});