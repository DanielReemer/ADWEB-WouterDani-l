import { archiveBook, restoreBook } from "@/services/bookArchive.service";
import { db } from "@/lib/firebase";

jest.mock("@/lib/firebase", () => ({
  db: {},
}));

const docMock = jest.fn();
const writeBatchMock = jest.fn();
const getDocMock = jest.fn();

const setMock = jest.fn();
const deleteMock = jest.fn();
const commitMock = jest.fn();

jest.mock("firebase/firestore", () => ({
  doc: (...args: any[]) => docMock(...args),
  writeBatch: (...args: any[]) => writeBatchMock(...args),
  getDoc: (...args: any[]) => getDocMock(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  writeBatchMock.mockReturnValue({
    set: setMock,
    delete: deleteMock,
    commit: commitMock,
  });
});

describe("archiveBook", () => {
  it("archives book when it exists", async () => {
    const userId = "u";
    const id = "b";
    const bookData = { foo: "bar" };
    const bookSnap = {
      exists: () => true,
      data: () => bookData,
    };
    getDocMock.mockResolvedValueOnce(bookSnap);

    docMock.mockReturnValueOnce("bookRef");
    docMock.mockReturnValueOnce("archivedRef");
    commitMock.mockResolvedValue(undefined);

    await archiveBook(userId, id);

    expect(docMock).toHaveBeenNthCalledWith(
      1,
      db,
      "users",
      userId,
      "books",
      id
    );
    expect(docMock).toHaveBeenNthCalledWith(
      2,
      db,
      "users",
      userId,
      "archivedBooks",
      id
    );
    expect(getDocMock).toHaveBeenCalledWith("bookRef");
    expect(setMock).toHaveBeenCalledWith(
      "archivedRef",
      expect.objectContaining(bookData)
    );
    expect(setMock.mock.calls[0][1].archivedAt).toBeInstanceOf(Date);
    expect(deleteMock).toHaveBeenCalledWith("bookRef");
    expect(commitMock).toHaveBeenCalled();
  });

  it("throws if book does not exist", async () => {
    const userId = "u";
    const id = "b";
    const bookSnap = {
      exists: () => false,
    };
    getDocMock.mockResolvedValueOnce(bookSnap);

    docMock.mockReturnValueOnce("bookRef");
    docMock.mockReturnValueOnce("archivedRef");

    await expect(archiveBook(userId, id)).rejects.toThrow("Book niet gevonden");
    expect(getDocMock).toHaveBeenCalledWith("bookRef");
    expect(setMock).not.toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
    expect(commitMock).not.toHaveBeenCalled();
  });
});

describe("restoreBook", () => {
  it("restores archived book when it exists", async () => {
    const userId = "u";
    const id = "b";
    const archivedData = { bar: "baz" };
    const archivedSnap = {
      exists: () => true,
      data: () => archivedData,
    };
    getDocMock.mockResolvedValueOnce(archivedSnap);

    docMock.mockReturnValueOnce("archivedRef");
    docMock.mockReturnValueOnce("bookRef");
    commitMock.mockResolvedValue(undefined);

    await restoreBook(userId, id);

    expect(docMock).toHaveBeenNthCalledWith(
      1,
      db,
      "users",
      userId,
      "archivedBooks",
      id
    );
    expect(docMock).toHaveBeenNthCalledWith(
      2,
      db,
      "users",
      userId,
      "books",
      id
    );
    expect(getDocMock).toHaveBeenCalledWith("archivedRef");
    expect(setMock).toHaveBeenCalledWith("bookRef", archivedData);
    expect(deleteMock).toHaveBeenCalledWith("archivedRef");
    expect(commitMock).toHaveBeenCalled();
  });

  it("throws if archived book does not exist", async () => {
    const userId = "u";
    const id = "b";
    const archivedSnap = {
      exists: () => false,
    };
    getDocMock.mockResolvedValueOnce(archivedSnap);

    docMock.mockReturnValueOnce("archivedRef");
    docMock.mockReturnValueOnce("bookRef");

    await expect(restoreBook(userId, id)).rejects.toThrow(
      "Gearchiveerd boek niet gevonden"
    );
    expect(getDocMock).toHaveBeenCalledWith("archivedRef");
    expect(setMock).not.toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
    expect(commitMock).not.toHaveBeenCalled();
  });
});
