import {
  listenToArchivedBook,
  listenToArchivedBooks,
  addArchivedBook,
  deleteArchivedBook,
} from "@/services/archivedBook.service";
import { db } from "@/lib/firebase";
import { ArchivedBook } from "@/lib/collections/Book";

jest.mock("@/lib/firebase", () => ({
  db: {},
}));

const onSnapshotMock = jest.fn();
const docMock = jest.fn();
const collectionMock = jest.fn();
const addDocMock = jest.fn();
const deleteDocMock = jest.fn();

jest.mock("firebase/firestore", () => ({
  doc: (...args: any[]) => docMock(...args),
  onSnapshot: (...args: any[]) => onSnapshotMock(...args),
  collection: (...args: any[]) => collectionMock(...args),
  addDoc: (...args: any[]) => addDocMock(...args),
  deleteDoc: (...args: any[]) => deleteDocMock(...args),
}));

describe("archivedBooks firestore wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listenToArchivedBook", () => {
    it("calls onSnapshot with correct params and processes book data", () => {
      const userId = "user";
      const id = "book1";
      const listener = jest.fn();

      const docSnapMock = {
        id,
        data: jest.fn().mockReturnValue({
          name: "Test Book",
          description: "Desc",
          balance: 100,
          archivedAt: { toDate: () => new Date("2023-01-01") },
        }),
      };

      onSnapshotMock.mockImplementation((_docRef, cb) => {
        cb(docSnapMock);
        return "unsub";
      });
      docMock.mockReturnValue("docRef");

      const unsub = listenToArchivedBook(userId, id, listener);

      expect(docMock).toHaveBeenCalledWith(
        db,
        "users",
        userId,
        "archivedBooks",
        id
      );
      expect(onSnapshotMock).toHaveBeenCalledWith(
        "docRef",
        expect.any(Function)
      );
      expect(listener).toHaveBeenCalledWith({
        id: "book1",
        name: "Test Book",
        description: "Desc",
        balance: 100,
        archivedAt: new Date("2023-01-01"),
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

      listenToArchivedBook(userId, id, listener);

      expect(listener).toHaveBeenCalledWith(undefined);
    });
  });

  describe("listenToArchivedBooks", () => {
    it("calls onSnapshot with correct collection and processes books", () => {
      const userId = "user";
      const listener = jest.fn();

      const docSnaps = [
        {
          id: "1",
          data: jest.fn().mockReturnValue({
            name: "Book1",
            description: "Desc1",
            balance: 10,
            archivedAt: { toDate: () => new Date("2023-01-01") },
          }),
        },
        {
          id: "2",
          data: jest.fn().mockReturnValue({
            name: "Book2",
            description: "",
            balance: 0,
            archivedAt: { toDate: () => new Date("2023-02-01") },
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

      const unsub = listenToArchivedBooks(userId, listener);

      expect(collectionMock).toHaveBeenCalledWith(
        db,
        "users",
        userId,
        "archivedBooks"
      );
      expect(onSnapshotMock).toHaveBeenCalledWith(
        "colRef",
        expect.any(Function)
      );
      expect(listener).toHaveBeenCalledWith([
        {
          id: "1",
          name: "Book1",
          description: "Desc1",
          balance: 10,
          archivedAt: new Date("2023-01-01"),
        },
        {
          id: "2",
          name: "Book2",
          description: "",
          balance: 0,
          archivedAt: new Date("2023-02-01"),
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

      listenToArchivedBooks(userId, listener);

      expect(listener).toHaveBeenCalledWith([]);
    });
  });

  describe("addArchivedBook", () => {
    it("calls addDoc with correct data", async () => {
      const userId = "user";
      const book: ArchivedBook = {
        id: "b1",
        name: "B",
        description: "D",
        balance: 5,
        archivedAt: new Date("2024-01-01"),
      };

      collectionMock.mockReturnValue("colRef");
      addDocMock.mockResolvedValue(undefined);

      await addArchivedBook(userId, book);

      expect(collectionMock).toHaveBeenCalledWith(
        db,
        "users",
        userId,
        "archivedBooks"
      );
      expect(addDocMock).toHaveBeenCalledWith("colRef", {
        name: "B",
        description: "D",
        balance: 5,
        archivedAt: expect.any(Date),
      });
    });
  });

  describe("deleteArchivedBook", () => {
    it("calls deleteDoc with correct doc ref", async () => {
      const userId = "user";
      const id = "b1";

      docMock.mockReturnValue("docRef");
      deleteDocMock.mockResolvedValue(undefined);

      await deleteArchivedBook(userId, id);

      expect(docMock).toHaveBeenCalledWith(
        db,
        "users",
        userId,
        "archivedBooks",
        id
      );
      expect(deleteDocMock).toHaveBeenCalledWith("docRef");
    });
  });
});
