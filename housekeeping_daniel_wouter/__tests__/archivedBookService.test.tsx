import { listenToArchivedBooks } from "@/services/archivedBook.service";
import { onSnapshot, query, where, collection, and } from "firebase/firestore";
import { db } from "@/lib/firebase";

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  and: jest.fn(),
  or: jest.fn(),
  where: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("listenToArchivedBooks", () => {
  const mockUserId = "testUserId";
  const mockListener = jest.fn();
  const mockQuery = {};
  const mockCollection = {};
  const mockSnapshot = {
    forEach: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (collection as jest.Mock).mockReturnValue(mockCollection);
    (query as jest.Mock).mockReturnValue(mockQuery);
    (and as jest.Mock).mockReturnValue({});
    (where as jest.Mock).mockImplementation((field, op, value) => ({ field, op, value }));
    (onSnapshot as jest.Mock).mockImplementation((_query, callback) => {
      callback(mockSnapshot);
      return jest.fn();
    });
  });

  it("should set up a query and listen to archived books", () => {
    const mockDocSnap1 = {
      exists: () => true,
      id: "book1",
      data: () => ({
        name: "Book 1",
        description: "Description 1",
        ownerId: mockUserId,
        transactionIds: ["txn1"],
        sharedWith: ["user1"],
        archivedAt: { toDate: () => new Date("2025-06-22T00:00:00Z") },
      }),
    };

    const mockDocSnap2 = {
      exists: () => true,
      id: "book2",
      data: () => ({
        name: "Book 2",
        description: "Description 2",
        ownerId: mockUserId,
        transactionIds: ["txn2"],
        sharedWith: ["user2"],
        archivedAt: { toDate: () => new Date("2025-06-21T00:00:00Z") },
      }),
    };

    mockSnapshot.forEach.mockImplementation((callback) => {
      callback(mockDocSnap1);
      callback(mockDocSnap2);
    });

    const unsubscribe = listenToArchivedBooks(mockUserId, mockListener);

    expect(collection).toHaveBeenCalledWith(db, "books");
    expect(where).toHaveBeenCalledWith("archivedAt", "!=", null);
    expect(where).toHaveBeenCalledWith("ownerId", "==", mockUserId);
    expect(and).toHaveBeenCalled();
    expect(query).toHaveBeenCalledWith(mockCollection, expect.anything());
    expect(onSnapshot).toHaveBeenCalledWith(mockQuery, expect.any(Function));
    expect(mockListener).toHaveBeenCalledWith([
      {
        id: "book1",
        name: "Book 1",
        description: "Description 1",
        ownerId: mockUserId,
        transactionIds: ["txn1"],
        sharedWith: ["user1"],
        archivedAt: new Date("2025-06-22T00:00:00Z"),
      },
      {
        id: "book2",
        name: "Book 2",
        description: "Description 2",
        ownerId: mockUserId,
        transactionIds: ["txn2"],
        sharedWith: ["user2"],
        archivedAt: new Date("2025-06-21T00:00:00Z"),
      },
    ]);

    expect(typeof unsubscribe).toBe("function");
  });

  it("should call listener with undefined if no books exist", () => {
    mockSnapshot.forEach.mockImplementation(() => {});
    listenToArchivedBooks(mockUserId, mockListener);

    expect(mockListener).toHaveBeenCalledWith(undefined);
  });
});