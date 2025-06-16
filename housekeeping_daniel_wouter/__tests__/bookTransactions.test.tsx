import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookTransactions from "@/app/books/[slug]/BookTransactions";
import { Timestamp } from "firebase/firestore";
import { filterTransactionsByMonth } from "@/lib/filterTransactions";
import "@testing-library/jest-dom";
import Transaction from "@/lib/Transaction";

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

jest.mock("@/lib/filterTransactions", () => ({
  filterTransactionsByMonth: jest.fn(),
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
  },
  {
    id: "2",
    userId: "user1",
    bookId: "book1",
    description: "Groceries",
    amount: 40,
    type: "expense",
    date: Timestamp.fromDate(new Date(2025, 5, 11)),
  },
  {
    id: "3",
    userId: "user1",
    bookId: "book1",
    description: "Transport",
    amount: 60,
    type: "expense",
    date: Timestamp.fromDate(new Date(2025, 4, 13)),
  },
];

describe("BookTransactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require("@/lib/filterTransactions").filterTransactionsByMonth as jest.Mock).mockImplementation((tx, month, year) => tx);
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
    expect(screen.getByText("Transport")).toBeInTheDocument();
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
    (require("@/lib/filterTransactions").filterTransactionsByMonth as jest.Mock).mockImplementation((tx, month, year) =>
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
    expect(require("@/lib/filterTransactions").filterTransactionsByMonth).toHaveBeenCalledWith(transactions, 5, 2025);
  });
});