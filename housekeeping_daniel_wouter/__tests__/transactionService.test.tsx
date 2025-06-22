import {
  listenToTransactions,
  listenToTransaction,
  addTransaction,
  updateTransaction,
  updateTransactionCategory,
  deleteTransaction,
} from "@/services/transaction.service";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  getDoc,
  where,
  and,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Transaction, { TransactionFormData } from "@/lib/Transaction";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  and: jest.fn(),
  orderBy: jest.fn(),
  getDoc: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date) => ({
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: (date.getTime() % 1000) * 1000000,
    })),
  },
}));

jest.mock("@/lib/firebase", () => ({
  db: jest.fn(),
}));

describe("TransactionService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("listenToTransactions", () => {
    it("should call onSnapshot with correct query", () => {
      const mockListener = jest.fn();
      const mockTransactionIds = ["id1", "id2"];
      const mockQuery = jest.fn();
      (query as jest.Mock).mockReturnValue(mockQuery);

      listenToTransactions(mockTransactionIds, mockListener);

      expect(query).toHaveBeenCalledWith(
        collection(db, "transactions"),
        and(
          where("archivedAt", "==", null),
          where("__name__", "in", mockTransactionIds)
        ),
        orderBy("date", "desc")
      );
      expect(onSnapshot).toHaveBeenCalledWith(mockQuery, expect.any(Function));
    });

    it("should return an empty array if transactionIds are empty", () => {
      const mockListener = jest.fn();

      const unsubscribe = listenToTransactions([], mockListener);

      expect(mockListener).toHaveBeenCalledWith([]);
      expect(unsubscribe).toEqual(expect.any(Function));
    });
  });

  describe("listenToTransaction", () => {
    it("should call onSnapshot with correct document reference", () => {
      const mockTransactionId = "transaction1";
      const mockListener = jest.fn();
      const mockDoc = { id: mockTransactionId };

      (doc as jest.Mock).mockReturnValue(mockDoc);

      listenToTransaction(mockTransactionId, mockListener);

      expect(doc).toHaveBeenCalledWith(db, "transactions", mockTransactionId);
      expect(onSnapshot).toHaveBeenCalledWith(mockDoc, expect.any(Function));
    });
  });

  describe("addTransaction", () => {
    it("should add a new transaction and update book document", async () => {
      const mockBookId = "book1";
      const mockTransactionFormData: TransactionFormData = {
        description: "Test description",
        amount: 100,
        type: "income",
        date: Timestamp.fromDate(new Date()),
        categoryId: null,
      };
      const mockTransactionDoc = { id: "newTransactionId" };
      const mockBookSnapshot = {
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue({ transactionIds: ["existingTransactionId"] }),
      };

      (addDoc as jest.Mock).mockResolvedValue(mockTransactionDoc);
      (getDoc as jest.Mock).mockResolvedValue(mockBookSnapshot);

      await addTransaction(mockBookId, mockTransactionFormData);

      expect(addDoc).toHaveBeenCalledWith(collection(db, "transactions"), {
        bookId: mockBookId,
        description: mockTransactionFormData.description,
        amount: mockTransactionFormData.amount,
        type: mockTransactionFormData.type,
        date: mockTransactionFormData.date,
        archivedAt: null,
        categoryId: mockTransactionFormData.categoryId,
      });

      expect(getDoc).toHaveBeenCalledWith(doc(db, "books", mockBookId));
      expect(updateDoc).toHaveBeenCalledWith(doc(db, "books", mockBookId), {
        transactionIds: ["existingTransactionId", "newTransactionId"],
      });
    });
  });

  describe("updateTransaction", () => {
    it("should update a transaction document", async () => {
      const mockTransactionId = "transaction1";
      const mockTransactionFormData: TransactionFormData = {
        description: "Updated description",
        amount: 200,
        type: "expense",
        date: Timestamp.fromDate(new Date()),
        categoryId: "categoryId1",
      };

      await updateTransaction(mockTransactionId, mockTransactionFormData);

      expect(updateDoc).toHaveBeenCalledWith(doc(db, "transactions", mockTransactionId), {
        description: mockTransactionFormData.description,
        amount: mockTransactionFormData.amount,
        type: mockTransactionFormData.type,
        date: mockTransactionFormData.date,
        categoryId: mockTransactionFormData.categoryId,
      });
    });
  });

  describe("updateTransactionCategory", () => {
    it("should update the transaction category", async () => {
      const mockTransaction = {
        id: "transaction1",
        bookId: "book1",
        description: "Test description",
        amount: 100,
        type: "income",
        date: Timestamp.fromDate(new Date()),
        categoryId: null,
      } as Transaction;
      const newCategoryId = "newCategoryId";

      await updateTransactionCategory(mockTransaction, newCategoryId);

      expect(updateDoc).toHaveBeenCalledWith(doc(db, "transactions", mockTransaction.id), {
        description: mockTransaction.description,
        amount: mockTransaction.amount,
        type: mockTransaction.type,
        date: mockTransaction.date,
        categoryId: newCategoryId,
      });
    });
  });

  describe("deleteTransaction", () => {
    it("should delete a transaction document", async () => {
      const mockTransactionId = "transaction1";

      await deleteTransaction(mockTransactionId);

      expect(deleteDoc).toHaveBeenCalledWith(doc(db, "transactions", mockTransactionId));
    });
  });
});