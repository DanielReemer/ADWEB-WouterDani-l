import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import BookPage from "@/app/books/[slug]/page";
import { useLoading as mockUseLoading } from "@/lib/hooks/useLoading";
import { useRequireUser as mockUseRequireUser } from "@/lib/hooks/useRequireUser";
import { listenToBook as mockListenToBook } from "@/services/book.service";
import {
  listenToTransactions as mockListenToTransactions,
  addTransaction as mockAddTransaction,
} from "@/services/transaction.service";
import { Book } from "@/lib/collections/Book";
import Transaction from "@/lib/collections/Transaction";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/lib/hooks/useLoading", () => ({
  __esModule: true,
  useLoading: jest.fn(),
}));
jest.mock("@/lib/hooks/useRequireUser", () => ({
  __esModule: true,
  useRequireUser: jest.fn(),
}));
jest.mock("@/services/book.service", () => ({
  __esModule: true,
  listenToBook: jest.fn(),
}));
jest.mock("@/services/transaction.service", () => ({
  __esModule: true,
  listenToTransactions: jest.fn(),
  addTransaction: jest.fn(),
}));

jest.mock("@/app/loading", () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading...</div>,
}));
jest.mock("@/app/books/[slug]/BookNotFound", () => ({
  __esModule: true,
  default: () => <div data-testid="book-not-found">Not found</div>,
}));
jest.mock("@/app/books/[slug]/BookDetails", () => ({
  __esModule: true,
  default: ({ book }: any) => (
    <div data-testid="book-details">{book?.name}</div>
  ),
}));
jest.mock("@/app/books/[slug]/BookTransactions", () => ({
  __esModule: true,
  default: ({ transactions, loading, error, onSave }: any) => (
    <div>
      <div data-testid="transactions-loading">
        {loading ? "loading" : "not-loading"}
      </div>
      <div data-testid="transactions-error">{error}</div>
      <div data-testid="transactions-count">{transactions.length}</div>
      <button
        data-testid="save-transaction"
        onClick={() =>
          onSave({
            amount: 1,
            type: "income",
            description: "desc",
            date: {},
            bookId: "b",
            userId: "u",
          })
        }
      >
        Save Transaction
      </button>
    </div>
  ),
}));

const mockSetLoaded = jest.fn();
const mockReset = jest.fn();

const book: Book = {
  id: "b1",
  name: "Test Book",
  description: "desc",
  balance: 100,
};
const user = { uid: "u" };
const transactions: Transaction[] = [
  {
    id: "t1",
    userId: "u",
    bookId: "b1",
    description: "D1",
    amount: 10,
    type: "income",
    date: {} as any,
    categoryId: "cat1",
  },
  {
    id: "t2",
    userId: "u",
    bookId: "b1",
    description: "D2",
    amount: 5,
    type: "expense",
    date: {} as any,
    categoryId: "cat2",
  },
];

describe("BookPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require("next/navigation").useParams as jest.Mock).mockReturnValue({
      slug: "test-slug",
    });
    (mockUseRequireUser as jest.Mock).mockReturnValue(user);
    (mockListenToBook as jest.Mock).mockReturnValue(jest.fn());
    (mockListenToTransactions as jest.Mock).mockReturnValue(jest.fn());
    (mockAddTransaction as jest.Mock).mockResolvedValue(undefined);
  });

  it("renders loading screen when loading", () => {
    (mockUseLoading as jest.Mock).mockReturnValue({
      loading: true,
      data: undefined,
      setLoaded: mockSetLoaded,
      reset: mockReset,
    });
    render(<BookPage />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders not found when no book", () => {
    (mockUseLoading as jest.Mock).mockReturnValue({
      loading: false,
      data: undefined,
      setLoaded: mockSetLoaded,
      reset: mockReset,
    });
    render(<BookPage />);
    expect(screen.getByTestId("book-not-found")).toBeInTheDocument();
  });

  it("renders book details and transactions", async () => {
    (mockUseLoading as jest.Mock).mockReturnValue({
      loading: false,
      data: book,
      setLoaded: mockSetLoaded,
      reset: mockReset,
    });

    let transactionsCb: (t: Transaction[]) => void = () => {};
    (mockListenToTransactions as jest.Mock).mockImplementation(
      (_uid, _slug, cb) => {
        transactionsCb = cb;
        return jest.fn();
      }
    );

    await act(async () => {
      render(<BookPage />);
    });

    await act(async () => {
      transactionsCb(transactions);
    });

    expect(screen.getByTestId("book-details")).toHaveTextContent("Test Book");
    expect(screen.getByTestId("transactions-count")).toHaveTextContent("2");
    expect(screen.getByTestId("transactions-loading")).toHaveTextContent(
      "not-loading"
    );
  });

  it("shows loading state for transactions", async () => {
    (mockUseLoading as jest.Mock).mockReturnValue({
      loading: false,
      data: book,
      setLoaded: mockSetLoaded,
      reset: mockReset,
    });

    await act(async () => {
      render(<BookPage />);
    });

    expect(screen.getByTestId("transactions-loading")).toHaveTextContent(
      "loading"
    );
  });

  it("calls addTransaction with correct args", async () => {
    (mockUseLoading as jest.Mock).mockReturnValue({
      loading: false,
      data: book,
      setLoaded: mockSetLoaded,
      reset: mockReset,
    });

    await act(async () => {
      render(<BookPage />);
    });

    fireEvent.click(screen.getByTestId("save-transaction"));

    await waitFor(() =>
      expect(mockAddTransaction).toHaveBeenCalledWith(
        "u",
        "test-slug",
        expect.objectContaining({
          amount: 1,
          type: "income",
          description: "desc",
        })
      )
    );
  });

  it("resets and subscribes to book and transactions on mount", async () => {
    (mockUseLoading as jest.Mock).mockReturnValue({
      loading: false,
      data: book,
      setLoaded: mockSetLoaded,
      reset: mockReset,
    });

    let bookCb: (b: Book | undefined) => void = () => {};
    (mockListenToBook as jest.Mock).mockImplementation((_uid, _slug, cb) => {
      bookCb = cb;
      return jest.fn();
    });

    let transactionsCb: (t: Transaction[]) => void = () => {};
    (mockListenToTransactions as jest.Mock).mockImplementation(
      (_uid, _slug, cb) => {
        transactionsCb = cb;
        return jest.fn();
      }
    );

    await act(async () => {
      render(<BookPage />);
    });

    expect(mockReset).toHaveBeenCalled();
    act(() => {
      bookCb(book);
      transactionsCb(transactions);
    });
    expect(mockSetLoaded).toHaveBeenCalledWith(book);
  });
});
