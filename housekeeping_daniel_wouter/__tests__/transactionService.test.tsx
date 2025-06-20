import {
  listenToTransactions,
  listenToTransaction,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/services/transaction.service";
import { db } from "@/lib/firebase";
import Transaction from "@/lib/collections/Transaction";
import { Timestamp } from "firebase/firestore";
import { act } from "react";

jest.mock("@/lib/firebase", () => ({
  db: {},
}));

const collectionMock = jest.fn();
const docMock = jest.fn();
const onSnapshotMock = jest.fn();
const addDocMock = jest.fn();
const updateDocMock = jest.fn();
const deleteDocMock = jest.fn();
const orderByMock = jest.fn();
const queryMock = jest.fn();
const actualFirestore = jest.requireActual("firebase/firestore");

jest.mock("firebase/firestore", () => ({
  collection: (...args: any[]) => collectionMock(...args),
  doc: (...args: any[]) => docMock(...args),
  onSnapshot: (...args: any[]) => onSnapshotMock(...args),
  addDoc: (...args: any[]) => addDocMock(...args),
  updateDoc: (...args: any[]) => updateDocMock(...args),
  deleteDoc: (...args: any[]) => deleteDocMock(...args),
  orderBy: (...args: any[]) => orderByMock(...args),
  query: (...args: any[]) => queryMock(...args),
}));


describe("transaction service firestore wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listenToTransactions", () => {
    it("calls onSnapshot with correct query and processes transactions", () => {
      const userId = "user";
      const bookId = "book";
      const listener = jest.fn();

      const docSnaps = [
        {
          id: "t1",
          data: jest.fn().mockReturnValue({
            description: "desc1",
            amount: 100,
            type: "income",
            date: "date1",
          }),
        },
        {
          id: "t2",
          data: jest.fn().mockReturnValue({
            description: "desc2",
            amount: 50,
            type: "expense",
            date: "date2",
          }),
        },
      ];

      const snapshotMock = {
        forEach: (cb: any) => docSnaps.forEach(cb),
      };

      collectionMock.mockReturnValue("colRef");
      orderByMock.mockReturnValue("orderByRef");
      queryMock.mockReturnValue("queryRef");

      onSnapshotMock.mockImplementation((q, cb) => {
        cb(snapshotMock);
        return "unsub";
      });

      const unsub = listenToTransactions(userId, bookId, listener);

      expect(collectionMock).toHaveBeenCalledWith(
        db,
        "users",
        userId,
        "books",
        bookId,
        "transactions"
      );
      expect(orderByMock).toHaveBeenCalledWith("date", "desc");
      expect(queryMock).toHaveBeenCalledWith("colRef", "orderByRef");
      expect(onSnapshotMock).toHaveBeenCalledWith(
        "queryRef",
        expect.any(Function)
      );
      expect(listener).toHaveBeenCalledWith([
        {
          id: "t1",
          userId: userId,
          bookId: bookId,
          description: "desc1",
          amount: 100,
          type: "income",
          date: "date1",
        },
        {
          id: "t2",
          userId: userId,
          bookId: bookId,
          description: "desc2",
          amount: 50,
          type: "expense",
          date: "date2",
        },
      ]);
      expect(unsub).toBe("unsub");
    });

    it("calls listener with empty array when no transactions exist", () => {
      const userId = "user";
      const bookId = "book";
      const listener = jest.fn();

      const snapshotMock = {
        forEach: (cb: any) => {},
      };

      collectionMock.mockReturnValue("colRef");
      orderByMock.mockReturnValue("orderByRef");
      queryMock.mockReturnValue("queryRef");

      onSnapshotMock.mockImplementation((q, cb) => {
        cb(snapshotMock);
        return "unsub";
      });

      listenToTransactions(userId, bookId, listener);

      expect(listener).toHaveBeenCalledWith([]);
    });
  });

  describe("listenToTransaction", () => {
    it("calls onSnapshot with correct doc ref and processes transaction", () => {
      const userId = "user";
      const bookId = "book";
      const transactionId = "tid";
      const listener = jest.fn();

      const docSnapMock = {
        id: transactionId,
        data: jest.fn().mockReturnValue({
          description: "desc",
          amount: 42,
          type: "income",
          date: "date1",
        }),
      };

      docMock.mockReturnValue("docRef");
      onSnapshotMock.mockImplementation((ref, cb) => {
        cb(docSnapMock);
        return "unsub";
      });

      const unsub = listenToTransaction(
        userId,
        bookId,
        transactionId,
        listener
      );

      expect(docMock).toHaveBeenCalledWith(
        db,
        "users",
        userId,
        "books",
        bookId,
        "transactions",
        transactionId
      );
      expect(onSnapshotMock).toHaveBeenCalledWith(
        "docRef",
        expect.any(Function)
      );
      expect(listener).toHaveBeenCalledWith({
        id: transactionId,
        userId: userId,
        bookId: bookId,
        description: "desc",
        amount: 42,
        type: "income",
        date: "date1",
      });
      expect(unsub).toBe("unsub");
    });

    it("calls listener with null if transaction not found", () => {
      const userId = "user";
      const bookId = "book";
      const transactionId = "tid";
      const listener = jest.fn();

      const docSnapMock = {
        id: transactionId,
        data: jest.fn().mockReturnValue(undefined),
      };

      docMock.mockReturnValue("docRef");
      onSnapshotMock.mockImplementation((ref, cb) => {
        cb(docSnapMock);
        return "unsub";
      });

      listenToTransaction(userId, bookId, transactionId, listener);

      expect(listener).toHaveBeenCalledWith(null);
    });
  });

  describe("addTransaction", () => {
    it("calls addDoc with correct data", async () => {
      const userId = "user";
      const bookId = "book";
      const transaction: Omit<Transaction, "id" | "userId" | "bookId"> = {
        description: "desc",
        amount: 21,
        type: "expense",
        date: actualFirestore.Timestamp.fromDate(new Date()),
      };

      collectionMock.mockReturnValue("colRef");
      addDocMock.mockResolvedValue(undefined);

      await addTransaction(userId, bookId, transaction);

      expect(collectionMock).toHaveBeenCalledWith(
        db,
        "users",
        userId,
        "books",
        bookId,
        "transactions"
      );
      expect(addDocMock).toHaveBeenCalledWith("colRef", {
        userId,
        bookId,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
      });
    });
  });

  describe("updateTransaction", () => {
    it("calls updateDoc with correct doc ref and update data", async () => {
      const userId = "user";
      const bookId = "book";
      const transactionId = "tid";
      const update = {
        description: "new desc",
        amount: 100,
      };

      docMock.mockReturnValue("docRef");
      updateDocMock.mockResolvedValue(undefined);

      await updateTransaction(userId, bookId, transactionId, update);

      expect(docMock).toHaveBeenCalledWith(
        db,
        "users",
        userId,
        "books",
        bookId,
        "transactions",
        transactionId
      );
      expect(updateDocMock).toHaveBeenCalledWith("docRef", {
        description: "new desc",
        amount: 100,
      });
    });
  });

  describe("deleteTransaction", () => {
    it("calls deleteDoc with correct doc ref", async () => {
      const userId = "user";
      const bookId = "book";
      const transactionId = "tid";

      docMock.mockReturnValue("docRef");
      deleteDocMock.mockResolvedValue(undefined);

      await deleteTransaction(userId, bookId, transactionId);

      expect(docMock).toHaveBeenCalledWith(
        db,
        "users",
        userId,
        "books",
        bookId,
        "transactions",
        transactionId
      );
      expect(deleteDocMock).toHaveBeenCalledWith("docRef");
    });
  });
});
