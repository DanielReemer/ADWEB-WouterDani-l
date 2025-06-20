import { render, screen } from "@testing-library/react";
import TransactionList from "@/app/books/[slug]/TransactionList";
import Transaction from "@/lib/collections/Transaction";
import "@testing-library/jest-dom";

jest.mock("@/app/books/[slug]/TransactionItem", () => ({
  __esModule: true,
  default: ({ transaction }: { transaction: Transaction }) => (
    <li data-testid="transaction-item">{transaction.description}</li>
  ),
}));

const mockTimestamp = {
  toDate: () => new Date("2024-01-01T00:00:00Z"),
} as any;

const makeTransaction = (overrides?: Partial<Transaction>): Transaction => ({
  id: "1",
  userId: "user1",
  bookId: "book1",
  description: "Test Transaction",
  amount: 100,
  type: "income",
  date: mockTimestamp,
  ...overrides,
});

describe("TransactionList", () => {
  it("renders empty state when no transactions", () => {
    render(<TransactionList transactions={[]} />);
    expect(
      screen.getByText("Geen transacties deze maand.")
    ).toBeInTheDocument();
  });

  it("renders a list of TransactionItem for each transaction", () => {
    const transactions = [
      makeTransaction({ id: "1", description: "First" }),
      makeTransaction({ id: "2", description: "Second" }),
    ];
    render(<TransactionList transactions={transactions} />);
    const items = screen.getAllByTestId("transaction-item");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("First");
    expect(items[1]).toHaveTextContent("Second");
  });
});
