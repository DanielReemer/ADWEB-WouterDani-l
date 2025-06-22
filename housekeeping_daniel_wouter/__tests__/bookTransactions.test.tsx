import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookTransactions from "@/app/books/[slug]/BookTransactions";
import { Timestamp } from "firebase/firestore";
import "@testing-library/jest-dom";
import Transaction from "@/lib/collections/Transaction";
import { filterTransactionsByCategory, filterTransactionsByMonth } from "@/lib/utils/filterTransactions";

jest.mock("next/navigation", () => ({
  useParams: () => ({ slug: "book1" }),
}));

jest.mock("@/app/books/[slug]/MonthSelector", () => ({
  __esModule: true,
  default: ({ selectedMonth, selectedYear, onChange }: any) => (
    <div>
      <span data-testid="month">{selectedMonth}</span>
      <span data-testid="year">{selectedYear}</span>
      <button data-testid="month-change" onClick={() => onChange({ month: 5, year: 2025 })}>
        Change Month
      </button>
    </div>
  ),
}));

jest.mock("@/app/books/[slug]/Statistics", () => ({
  __esModule: true,
  default: ({ income, expense }: any) => (
    <div>
      <span data-testid="income">{income}</span>
      <span data-testid="expense">{expense}</span>
    </div>
  ),
}));

jest.mock("@/app/books/[slug]/TransactionList", () => ({
  __esModule: true,
  default: ({ transactions }: any) => (
    <ul data-testid="transaction-list">
      {transactions.map((t: any) => (
        <li key={t.id}>{t.description}</li>
      ))}
    </ul>
  ),
}));

jest.mock("@/app/ui/SkeletonTransactionList", () => ({
  __esModule: true,
  default: () => <div data-testid="skeleton-list">Loading...</div>,
}));

const mockOnSave = jest.fn(() => Promise.resolve());

const mockFormSubmit = jest.fn();

jest.mock("@/app/books/[slug]/TransactionForm", () => ({
  __esModule: true,
  default: ({ onSave }: any) => (
    <form
      data-testid="transaction-form"
      onSubmit={e => {
        e.preventDefault();
        mockFormSubmit();
        onSave({ amount: 100, type: "income", description: "Test", date: Timestamp.fromDate(new Date()), bookId: "book1", userId: "user1" });
      }}
    >
      <button type="submit">Submit</button>
    </form>
  ),
}));

jest.mock("@/lib/hooks/useRequireUser", () => ({
  useRequireUser: () => ({ uid: "test-user" }),
}));

jest.mock("@/lib/utils/filterTransactions", () => ({
  filterTransactionsByMonth: jest.fn(),
  filterTransactionsByCategory: jest.fn(),
}));

jest.mock("@/services/category.service", () => ({
  getCategories: jest.fn((slug, callback) => {
    callback([
      { id: "cat1", name: "Food" },
      { id: "cat2", name: "Transport" },
    ]);
  }),
}));
  

const transactions: Transaction[] = [
  {
    id: "1",
    userId: "user1",
    bookId: "book1",
    description: "Salary",
    amount: 100,
    type: "income",
    date: Timestamp.fromDate(new Date(2025, 5, 10)),
    categoryId: null,
  },
  {
    id: "2",
    userId: "user1",
    bookId: "book1",
    description: "Groceries",
    amount: 40,
    type: "expense",
    date: Timestamp.fromDate(new Date(2025, 5, 11)),
    categoryId: null,
  },
  {
    id: "3",
    userId: "user1",
    bookId: "book1",
    description: "Transport",
    amount: 60,
    type: "expense",
    date: Timestamp.fromDate(new Date(2025, 4, 13)),
    categoryId: null,
  },
];

describe("BookTransactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require("@/lib/utils/filterTransactions").filterTransactionsByMonth as jest.Mock).mockImplementation((tx, month, year) => tx)
    (require("@/lib/utils/filterTransactions").filterTransactionsByCategory as jest.Mock).mockImplementation((tx: any, categoryId: any) => tx);
  });

  it("renders loading skeleton when loading", () => {
    render(
      <BookTransactions
        transactions={transactions}
        loading={true}
        error={null}
        onSave={mockOnSave}
      />
    );
    expect(screen.getByTestId("skeleton-list")).toBeInTheDocument();
    expect(screen.getByText("Transacties")).toBeInTheDocument();
  });

  it("renders error message", () => {
    render(
      <BookTransactions
        transactions={transactions}
        loading={false}
        error="Failed to load"
        onSave={mockOnSave}
      />
    );
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("renders button, month selector, statistics, and transaction list", () => {
    render(
      <BookTransactions
        transactions={transactions}
        loading={false}
        error={null}
        onSave={mockOnSave}
      />
    );
    expect(screen.getByText("Nieuwe transactie")).toBeInTheDocument();
    expect(screen.getByTestId("month")).toBeInTheDocument();
    expect(screen.getByTestId("year")).toBeInTheDocument();
    expect(screen.getByTestId("income")).toHaveTextContent("100");
    expect(screen.getByTestId("expense")).toHaveTextContent("100");
    expect(screen.getByTestId("transaction-list")).toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("shows and hides transaction form on button click", () => {
    render(
      <BookTransactions
        transactions={transactions}
        loading={false}
        error={null}
        onSave={mockOnSave}
      />
    );
    const button = screen.getByText("Nieuwe transactie");
    fireEvent.click(button);
    expect(screen.getByTestId("transaction-form")).toBeInTheDocument();
    expect(screen.getByText("Annuleer")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Annuleer"));
    expect(screen.queryByTestId("transaction-form")).not.toBeInTheDocument();
  });

  it("calls onSave and closes form after transaction save", async () => {
    render(
      <BookTransactions
        transactions={transactions}
        loading={false}
        error={null}
        onSave={mockOnSave}
      />
    );
    fireEvent.click(screen.getByText("Nieuwe transactie"));
    fireEvent.submit(screen.getByTestId("transaction-form"));
    await waitFor(() => expect(mockFormSubmit).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 100,
          type: "income",
          description: "Test",
          bookId: "book1",
          userId: "user1",
          date: expect.any(Timestamp),
        })
      )
    );
    await waitFor(() => expect(screen.queryByTestId("transaction-form")).not.toBeInTheDocument());
  });

  it("filters transactions by selected month and year when month selector changes", () => {
    (require("@/lib/utils/filterTransactions").filterTransactionsByMonth as jest.Mock).mockImplementation((tx, month, year) =>
      month === 5 && year === 2025 ? [tx[0], tx[1]] : [tx[2]]
    );
    render(
      <BookTransactions
        transactions={transactions}
        loading={false}
        error={null}
        onSave={mockOnSave}
      />
    );
    fireEvent.click(screen.getByTestId("month-change"));
    expect(require("@/lib/utils/filterTransactions").filterTransactionsByMonth).toHaveBeenCalledWith(transactions, 5, 2025);
  });
});