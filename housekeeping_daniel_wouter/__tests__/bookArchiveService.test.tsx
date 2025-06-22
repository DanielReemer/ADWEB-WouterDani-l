import { archiveBook, restoreBook } from "@/services/bookArchive.service";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  writeBatch: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("archiveBook", () => {
  const mockBookId = "testBookId";
  const mockTransactionId = "testTransactionId";
  const mockBookSnapshot = {
    exists: jest.fn(),
    data: jest.fn(),
  };
  const mockTransactionSnapshot = {
    exists: jest.fn(),
    data: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (doc as jest.Mock).mockImplementation((_, collection, id) => ({
      collection,
      id,
    }));
    (getDoc as jest.Mock).mockImplementation((ref) => {
      if (ref.id === mockBookId) return mockBookSnapshot;
      if (ref.id === mockTransactionId) return mockTransactionSnapshot;
    });
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
    (serverTimestamp as jest.Mock).mockReturnValue(new Date());
  });

  it("should archive a book and its transactions", async () => {
    mockBookSnapshot.exists.mockReturnValue(true);
    mockBookSnapshot.data.mockReturnValue({
      transactionIds: [mockTransactionId],
    });
    mockTransactionSnapshot.exists.mockReturnValue(true);

    await archiveBook(mockBookId);

    expect(doc).toHaveBeenCalledWith(db, "books", mockBookId);
    expect(getDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockBookId })
    );
    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockBookId }),
      { archivedAt: expect.any(Date) }
    );
    expect(doc).toHaveBeenCalledWith(db, "transactions", mockTransactionId);
    expect(getDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockTransactionId })
    );
    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockTransactionId }),
      { archivedAt: expect.any(Date) }
    );
  });

  it("should throw an error if the book does not exist", async () => {
    mockBookSnapshot.exists.mockReturnValue(false);

    await expect(archiveBook(mockBookId)).rejects.toThrow(
      `Book with ID ${mockBookId} does not exist.`
    );

    expect(updateDoc).not.toHaveBeenCalled();
  });

  it("should throw an error if a transaction does not exist", async () => {
    mockBookSnapshot.exists.mockReturnValue(true);
    mockBookSnapshot.data.mockReturnValue({
      transactionIds: [mockTransactionId],
    });
    mockTransactionSnapshot.exists.mockReturnValue(false);

    await expect(archiveBook(mockBookId)).rejects.toThrow(
      `Transaction with ID ${mockTransactionId} does not exist.`
    );

    expect(updateDoc).toHaveBeenCalledTimes(1);
  });
});

describe("restoreBook", () => {
  const mockUserId = "testUserId";
  const mockBookId = "testBookId";
  const mockTransactionId = "testTransactionId";
  const mockBookSnapshot = {
    exists: jest.fn(),
    data: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (doc as jest.Mock).mockImplementation((_, collection, id) => ({
      collection,
      id,
    }));
    (getDoc as jest.Mock).mockImplementation((ref) => {
      if (ref.id === mockBookId) return mockBookSnapshot;
    });
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
  });

  it("should restore a book and its transactions", async () => {
    mockBookSnapshot.exists.mockReturnValue(true);
    mockBookSnapshot.data.mockReturnValue({
      ownerId: mockUserId,
      transactionIds: [mockTransactionId],
    });

    await restoreBook(mockUserId, mockBookId);

    expect(doc).toHaveBeenCalledWith(db, "books", mockBookId);
    expect(getDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockBookId })
    );
    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockBookId }),
      { archivedAt: null }
    );
    expect(doc).toHaveBeenCalledWith(db, "transactions", mockTransactionId);
    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockTransactionId }),
      { archivedAt: null }
    );
  });

  it("should throw an error if the book does not exist", async () => {
    mockBookSnapshot.exists.mockReturnValue(false);

    await expect(restoreBook(mockUserId, mockBookId)).rejects.toThrow(
      `Book with ID ${mockBookId} does not exist.`
    );

    expect(updateDoc).not.toHaveBeenCalled();
  });

  it("should throw an error if the user is not authorized to restore the book", async () => {
    mockBookSnapshot.exists.mockReturnValue(true);
    mockBookSnapshot.data.mockReturnValue({
      ownerId: "anotherUserId",
      transactionIds: [mockTransactionId],
    });

    await expect(restoreBook(mockUserId, mockBookId)).rejects.toThrow(
      "You are not authorized to restore this book."
    );

    expect(updateDoc).not.toHaveBeenCalled();
  });
});
