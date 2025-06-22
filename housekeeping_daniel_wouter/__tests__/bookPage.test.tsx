import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookPage from "@/app/books/page";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { listenToBooks } from "@/services/book.service";
import { listenToTransactions } from "@/services/transaction.service";
import { inviteToShareBook } from "@/services/bookShare.service";
import "@testing-library/jest-dom";

jest.mock("@/lib/hooks/useRequireUser", () => ({
  useRequireUser: jest.fn(),
}));

jest.mock("@/services/book.service", () => ({
  listenToBooks: jest.fn(),
}));

jest.mock("@/services/transaction.service", () => ({
  listenToTransaction: jest.fn(),
  listenToTransactions: jest.fn(),
}));

jest.mock("@/services/bookShare.service", () => ({
  inviteToShareBook: jest.fn(),
}));

jest.mock("next/link", () => {
  return ({ href, children }: any) => <a href={href}>{children}</a>;
});

jest.mock("@/lib/utils/calculateBalance", () => ({
  calculateBalance: jest.fn(() => 100),
}));

jest.mock("@/app/books/ShareBookModal", () => ({
  __esModule: true,
  default: ({ onSubmit, loading, error, success, bookName }: any) => (
    <div>
      <h3>Share {bookName}</h3>
      {error && <div>{error}</div>}
      {success && <div>{success}</div>}
      <button disabled={loading} onClick={() => onSubmit(["test@example.com"])}>
        {loading ? "Loading..." : "Submit"}
      </button>
    </div>
  ),
}));

describe("BookPage", () => {
  const mockUser = { uid: "testUserId" };
  const mockBooks = [
    { id: "book1", name: "Book 1", ownerId: "testUserId", transactionIds: [] },
    {
      id: "book2",
      name: "Book 2",
      ownerId: "otherUserId",
      sharedWith: ["testUserId"],
      transactionIds: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRequireUser as jest.Mock).mockReturnValue(mockUser);
    (listenToBooks as jest.Mock).mockImplementation((_uid, callback) => {
      callback(mockBooks);
      return jest.fn();
    });
    (listenToTransactions as jest.Mock).mockImplementation(
      (_transactionIds, callback) => {
        callback([]);
        return jest.fn();
      }
    );
  });

  it("renders the page header and links", () => {
    render(<BookPage />);

    expect(screen.getByText("Huishoudboekjes")).toBeInTheDocument();
    expect(screen.getByText("Nieuw boek +")).toHaveAttribute(
      "href",
      "/books/create"
    );
    expect(screen.getByText("Archief")).toHaveAttribute(
      "href",
      "/books/archive"
    );
  });

  it("renders the list of books", () => {
    render(<BookPage />);

    expect(screen.getByText("Book 1")).toBeInTheDocument();
    expect(screen.getByText("Book 2")).toBeInTheDocument();
  });

  it("renders balance for each book", () => {
    render(<BookPage />);

    expect(screen.getAllByText("€ 100,00")).toHaveLength(2);
  });

  it("opens the share modal when share button is clicked", async () => {
    render(<BookPage />);

    fireEvent.click(screen.getByLabelText("Deel boek Book 1"));

    await waitFor(() => {
      expect(screen.getByText("Share Book 1")).toBeInTheDocument();
    });
  });

  it("submits the share form successfully", async () => {
    (inviteToShareBook as jest.Mock).mockResolvedValue(undefined);

    render(<BookPage />);

    fireEvent.click(screen.getByLabelText("Deel boek Book 1"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(inviteToShareBook).toHaveBeenCalledWith(
        "testUserId",
        "book1",
        "Book 1",
        ["test@example.com"]
      );
      expect(screen.getByText("Uitnodiging verstuurd!")).toBeInTheDocument();
    });
  });

  it("displays error when share fails", async () => {
    (inviteToShareBook as jest.Mock).mockRejectedValue(
      new Error("Error sharing")
    );

    render(<BookPage />);

    fireEvent.click(screen.getByLabelText("Deel boek Book 1"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByText("Error sharing")).toBeInTheDocument();
    });
  });
});
