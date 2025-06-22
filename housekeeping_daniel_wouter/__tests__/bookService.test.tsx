import {
  listenToBook,
  listenToBooks,
  addBook,
  updateBook,
  deleteBook,
  acceptBookShare,
} from "@/services/book.service";
import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  and,
  or,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  or: jest.fn(),
  and: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("listenToBook", () => {
  const mockBookId = "testBookId";
  const mockListener = jest.fn();
  const mockDocSnap = {
    exists: jest.fn(),
    data: jest.fn(),
    id: mockBookId,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (doc as jest.Mock).mockReturnValue({});
    (onSnapshot as jest.Mock).mockImplementation((_docRef, callback) => {
      callback(mockDocSnap);
      return jest.fn();
    });
  });

  it("should call listener with book data if book exists and is not archived", () => {
    mockDocSnap.exists.mockReturnValue(true);
    mockDocSnap.data.mockReturnValue({
      ownerId: "testUserId",
      name: "Test Book",
      description: "Test Description",
      transactionIds: [],
      sharedWith: [],
      archivedAt: null,
    });

    listenToBook(mockBookId, mockListener);

    expect(mockListener).toHaveBeenCalledWith({
      id: mockBookId,
      ownerId: "testUserId",
      name: "Test Book",
      description: "Test Description",
      transactionIds: [],
      sharedWith: [],
    });
  });

  it("should call listener with undefined if book does not exist", () => {
    mockDocSnap.exists.mockReturnValue(false);

    listenToBook(mockBookId, mockListener);

    expect(mockListener).toHaveBeenCalledWith(undefined);
  });

  it("should not call listener if book is archived", () => {
    mockDocSnap.exists.mockReturnValue(true);
    mockDocSnap.data.mockReturnValue({
      archivedAt: new Date(),
    });

    listenToBook(mockBookId, mockListener);

    expect(mockListener).not.toHaveBeenCalled();
  });
});

describe("listenToBooks", () => {
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
    (where as jest.Mock).mockImplementation((field, op, value) => ({
      field,
      op,
      value,
    }));
    (or as jest.Mock).mockImplementation(() => ({}));
    (onSnapshot as jest.Mock).mockImplementation((_query, callback) => {
      callback(mockSnapshot);
      return jest.fn();
    });
  });

  it("should call listener with books list", () => {
    const mockDocSnap1 = {
      exists: () => true,
      id: "book1",
      data: () => ({
        name: "Book 1",
        description: "Description 1",
        ownerId: mockUserId,
        transactionIds: [],
        sharedWith: [],
      }),
    };

    const mockDocSnap2 = {
      exists: () => true,
      id: "book2",
      data: () => ({
        name: "Book 2",
        description: "Description 2",
        ownerId: mockUserId,
        transactionIds: [],
        sharedWith: [],
      }),
    };

    mockSnapshot.forEach.mockImplementation((callback) => {
      callback(mockDocSnap1);
      callback(mockDocSnap2);
    });

    listenToBooks(mockUserId, mockListener);

    expect(mockListener).toHaveBeenCalledWith([
      {
        id: "book1",
        name: "Book 1",
        description: "Description 1",
        ownerId: mockUserId,
        transactionIds: [],
        sharedWith: [],
      },
      {
        id: "book2",
        name: "Book 2",
        description: "Description 2",
        ownerId: mockUserId,
        transactionIds: [],
        sharedWith: [],
      },
    ]);
  });

  it("should call listener with undefined if no books exist", () => {
    mockSnapshot.forEach.mockImplementation(() => {});

    listenToBooks(mockUserId, mockListener);

    expect(mockListener).toHaveBeenCalledWith(undefined);
  });
});

describe("addBook", () => {
  const mockUserId = "testUserId";
  const mockBookFormData = {
    name: "New Book",
    description: "New Book Description",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (addDoc as jest.Mock).mockResolvedValue(undefined);
  });

  it("should add a new book to the database", async () => {
    await addBook(mockUserId, mockBookFormData);

    expect(addDoc).toHaveBeenCalledWith(collection(db, "books"), {
      name: "New Book",
      description: "New Book Description",
      ownerId: mockUserId,
      transactionIds: [],
      sharedWith: [],
      archivedAt: null,
    });
  });
});

describe("updateBook", () => {
  const mockBookId = "testBookId";
  const mockBookData = {
    name: "Updated Book",
    description: "Updated Description",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
  });

  it("should update book in the database", async () => {
    await updateBook(mockBookId, mockBookData);

    expect(updateDoc).toHaveBeenCalledWith(doc(db, "books", mockBookId), {
      name: "Updated Book",
      description: "Updated Description",
    });
  });
});

describe("deleteBook", () => {
  const mockUserId = "testUserId";
  const mockBookId = "testBookId";

  beforeEach(() => {
    jest.clearAllMocks();
    (deleteDoc as jest.Mock).mockResolvedValue(undefined);
  });

  it("should delete book from the database", async () => {
    await deleteBook(mockUserId, mockBookId);

    expect(deleteDoc).toHaveBeenCalledWith(doc(db, "books", mockBookId));
  });
});

describe("acceptBookShare", () => {
  const mockInvitationId = "invitation1";
  const mockUserId = "testUserId";
  const mockBookId = "book1";
  const mockBookSnap = {
    data: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (doc as jest.Mock).mockReturnValue({});
    (getDoc as jest.Mock).mockResolvedValue(mockBookSnap);
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
    (deleteDoc as jest.Mock).mockResolvedValue(undefined);
  });

  it("should add user to sharedWith list and delete the invitation", async () => {
    mockBookSnap.data.mockReturnValue({
      sharedWith: ["otherUserId"],
    });

    await acceptBookShare(mockInvitationId, mockUserId, mockBookId);

    expect(updateDoc).toHaveBeenCalledWith(doc(db, "books", mockBookId), {
      sharedWith: ["otherUserId", mockUserId],
    });
    expect(deleteDoc).toHaveBeenCalledWith(
      doc(db, "shareInvitations", mockInvitationId)
    );
  });

  it("should not update sharedWith if book data is undefined", async () => {
    mockBookSnap.data.mockReturnValue(undefined);

    await acceptBookShare(mockInvitationId, mockUserId, mockBookId);

    expect(updateDoc).not.toHaveBeenCalled();
    expect(deleteDoc).not.toHaveBeenCalled();
  });
});
