import {
  listenToBook,
  listenToBooks,
  addBook,
  updateBook,
  deleteBook,
} from "@/services/book.service";
import { db } from "@/lib/firebase";

jest.mock("@/lib/firebase", () => ({
  db: {},
}));

const onSnapshotMock = jest.fn();
const docMock = jest.fn();
const collectionMock = jest.fn();
const addDocMock = jest.fn();
const updateDocMock = jest.fn();
const deleteDocMock = jest.fn();

jest.mock("firebase/firestore", () => ({
  doc: (...args: any[]) => docMock(...args),
  onSnapshot: (...args: any[]) => onSnapshotMock(...args),
  collection: (...args: any[]) => collectionMock(...args),
  addDoc: (...args: any[]) => addDocMock(...args),
  updateDoc: (...args: any[]) => updateDocMock(...args),
  deleteDoc: (...args: any[]) => deleteDocMock(...args),
}));

describe("books firestore wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listenToBook", () => {
    it("calls onSnapshot with correct params and processes book data", () => {
      const userId = "user";
      const id = "book1";
      const listener = jest.fn();

      const docSnapMock = {
        id,
        data: jest.fn().mockReturnValue({
          name: "Book",
          description: "Desc",
          balance: 42,
        }),
      };

      onSnapshotMock.mockImplementation((_docRef, cb) => {
        cb(docSnapMock);
        return "unsub";
      });
      docMock.mockReturnValue("docRef");

      const unsub = listenToBook(userId, id, listener);

      expect(docMock).toHaveBeenCalledWith(db, "users", userId, "books", id);
      expect(onSnapshotMock).toHaveBeenCalledWith(
        "docRef",
        expect.any(Function)
      );
      expect(listener).toHaveBeenCalledWith({
        id: "book1",
        name: "Book",
        description: "Desc",
        balance: 42,
      });
      expect(unsub).toBe("unsub");
    });

    it("calls listener with undefined if no data", () => {
      const userId = "u";
      const id = "bid";
      const listener = jest.fn();

      const docSnapMock = {
        id,
        data: jest.fn().mockReturnValue(undefined),
      };

      onSnapshotMock.mockImplementation((_docRef, cb) => {
        cb(docSnapMock);
        return "unsub";
      });
      docMock.mockReturnValue("docRef");

      listenToBook(userId, id, listener);

      expect(listener).toHaveBeenCalledWith(undefined);
    });
  });

  describe("listenToBooks", () => {
    it("calls onSnapshot with correct collection and processes books", () => {
      const userId = "user";
      const listener = jest.fn();

      const docSnaps = [
        {
          id: "1",
          data: jest.fn().mockReturnValue({
            name: "A",
            description: "D1",
            balance: 10,
          }),
        },
        {
          id: "2",
          data: jest.fn().mockReturnValue({
            name: "B",
            description: "",
            balance: 20,
          }),
        },
      ];

      const snapshotMock = {
        forEach: (cb: any) => docSnaps.forEach(cb),
      };

      onSnapshotMock.mockImplementation((_colRef, cb) => {
        cb(snapshotMock);
        return "unsub";
      });
      collectionMock.mockReturnValue("colRef");

      const unsub = listenToBooks(userId, listener);

      expect(collectionMock).toHaveBeenCalledWith(db, "users", userId, "books");
      expect(onSnapshotMock).toHaveBeenCalledWith(
        "colRef",
        expect.any(Function)
      );
      expect(listener).toHaveBeenCalledWith([
        {
          id: "1",
          name: "A",
          description: "D1",
          balance: 10,
        },
        {
          id: "2",
          name: "B",
          description: "",
          balance: 20,
        },
      ]);
      expect(unsub).toBe("unsub");
    });

    it("calls listener with empty array if no books", () => {
      const userId = "user";
      const listener = jest.fn();
      const snapshotMock = {
        forEach: (cb: any) => {},
      };

      onSnapshotMock.mockImplementation((_colRef, cb) => {
        cb(snapshotMock);
        return "unsub";
      });
      collectionMock.mockReturnValue("colRef");

      listenToBooks(userId, listener);

      expect(listener).toHaveBeenCalledWith([]);
    });
  });

  describe("addBook", () => {
    it("calls addDoc with correct data", async () => {
      const userId = "user";
      const book = {
        name: "N",
        description: "D",
        balance: 7,
      };

      collectionMock.mockReturnValue("colRef");
      addDocMock.mockResolvedValue(undefined);

      await addBook(userId, book);

      expect(collectionMock).toHaveBeenCalledWith(db, "users", userId, "books");
      expect(addDocMock).toHaveBeenCalledWith("colRef", {
        name: "N",
        description: "D",
        balance: 7,
      });
    });
  });

  describe("updateBook", () => {
    it("calls updateDoc with correct doc ref and data", async () => {
      const userId = "user";
      const id = "b1";
      const book = {
        name: "N",
        description: "D",
      };

      docMock.mockReturnValue("docRef");
      updateDocMock.mockResolvedValue(undefined);

      await updateBook(userId, id, book);

      expect(docMock).toHaveBeenCalledWith(db, "users", userId, "books", id);
      expect(updateDocMock).toHaveBeenCalledWith("docRef", {
        name: "N",
        description: "D",
      });
    });
  });

  describe("deleteBook", () => {
    it("calls deleteDoc with correct doc ref", async () => {
      const userId = "user";
      const id = "b1";

      docMock.mockReturnValue("docRef");
      deleteDocMock.mockResolvedValue(undefined);

      await deleteBook(userId, id);

      expect(docMock).toHaveBeenCalledWith(db, "users", userId, "books", id);
      expect(deleteDocMock).toHaveBeenCalledWith("docRef");
    });
  });
});
