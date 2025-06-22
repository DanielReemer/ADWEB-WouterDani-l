import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import BookPage from "@/app/books/[slug]/page";
import { useParams } from "next/navigation";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { listenToBook } from "@/services/book.service";
import {
  listenToTransactions,
  addTransaction,
} from "@/services/transaction.service";
import { calculateBalance } from "@/lib/utils/calculateBalance";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/lib/hooks/useRequireUser", () => ({
  useRequireUser: jest.fn(),
}));

jest.mock("@/services/book.service", () => ({
  listenToBook: jest.fn(),
}));

jest.mock("@/services/transaction.service", () => ({
  listenToTransactions: jest.fn(),
  addTransaction: jest.fn(),
}));

jest.mock("@/lib/utils/calculateBalance", () => ({
  calculateBalance: jest.fn(() => 100),
}));

jest.mock("@/app/loading", () => () => <div>Loading...</div>);
jest.mock("@/app/books/[slug]/BookDetails", () => ({ book, balance }: any) => (
  <div>
    <h3>Book Details</h3>
    <p>{book.name}</p>
    <p>{balance}</p>
  </div>
));
jest.mock("@/app/books/[slug]/BookNotFound", () => () => (
  <div>Book Not Found</div>
));
jest.mock(
  "@/app/books/[slug]/BookTransactions",
  () =>
    ({ transactions, loading, onSave }: any) =>
      (
        <div>
          <h3>Transactions</h3>
          {loading && <p>Loading Transactions...</p>}
          <button onClick={() => onSave({ amount: 200 })}>
            Save Transaction
          </button>
          {transactions.map((tx: any) => (
            <p key={tx.id}>{tx.description}</p>
          ))}
        </div>
      )
);
jest.mock("@/app/books/[slug]/CategorySidebar", () => ({ transactions }: any) => (
  <div>
    <h3>Category Sidebar</h3>
    {transactions.map((tx: any) => (
      <p key={tx.id}>{tx.category}</p>
    ))}
  </div>
));

describe("BookPage", () => {
  const mockSlug = "book1";
  const mockUser = { uid: "testUserId" };
  const mockBook = {
    id: mockSlug,
    name: "Test Book",
    transactionIds: ["tx1", "tx2"],
  };
  const mockTransactions = [
    { id: "tx1", description: "Transaction 1", category: "Category 1" },
    { id: "tx2", description: "Transaction 2", category: "Category 2" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ slug: mockSlug });
    (useRequireUser as jest.Mock).mockReturnValue(mockUser);
    (listenToBook as jest.Mock).mockImplementation((_id, callback) => {
      callback(mockBook);
      return jest.fn();
    });
    (listenToTransactions as jest.Mock).mockImplementation((_ids, callback) => {
      callback(mockTransactions);
      return jest.fn();
    });
    (addTransaction as jest.Mock).mockResolvedValue(undefined);
  });

  it("renders loading state initially", () => {
    (listenToBook as jest.Mock).mockImplementation(() => jest.fn());

    render(<BookPage />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders BookNotFound if book is not found", () => {
    (listenToBook as jest.Mock).mockImplementation((_id, callback) => {
      callback(undefined);
      return jest.fn();
    });

    render(<BookPage />);

    expect(screen.getByText("Book Not Found")).toBeInTheDocument();
  });

  it("renders BookDetails and BookTransactions when book is loaded", async () => {
    render(<BookPage />);

    await waitFor(() => {
      expect(screen.getByText("Book Details")).toBeInTheDocument();
      expect(screen.getByText("Test Book")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("Transactions")).toBeInTheDocument();
      expect(screen.getByText("Transaction 1")).toBeInTheDocument();
      expect(screen.getByText("Transaction 2")).toBeInTheDocument();
    });
  });

  it("handles saving a transaction", async () => {
    render(<BookPage />);

    fireEvent.click(screen.getByText("Save Transaction"));

    await waitFor(() => {
      expect(addTransaction).toHaveBeenCalledWith(mockSlug, { amount: 200 });
    });
  });

  it("renders the CategorySidebar", async () => {
    render(<BookPage />);

    await waitFor(() => {
      expect(screen.getByText("Category Sidebar")).toBeInTheDocument();
      expect(screen.getByText("Category 1")).toBeInTheDocument();
      expect(screen.getByText("Category 2")).toBeInTheDocument();
    });
  });
});
