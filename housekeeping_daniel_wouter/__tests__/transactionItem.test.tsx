import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransactionItem from "@/app/books/[slug]/TransactionItem";
import Transaction from "@/lib/collections/Transaction";
import "@testing-library/jest-dom";
import { Timestamp } from "firebase/firestore";

jest.mock("@/app/books/[slug]/TransactionForm", () => ({
  __esModule: true,
  default: ({ onSave }: any) => (
    <form
      data-testid="transaction-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ updated: true });
      }}
    >
      <button type="submit">Opslaan</button>
    </form>
  ),
}));

jest.mock("@/services/transaction.service", () => ({
  deleteTransaction: jest.fn(() => Promise.resolve()),
  updateTransaction: jest.fn(() => Promise.resolve()),
}));

const mockDate = {
  toDate: () => new Date("2024-05-15T00:00:00Z"),
};

const makeTransaction = (overrides?: Partial<Transaction>): Transaction => ({
  id: "t1",
  userId: "u1",
  bookId: "b1",
  description: "Lunch",
  amount: 12.5,
  type: "expense",
  date: Timestamp.fromDate(mockDate.toDate()),
  ...overrides,
});

let consoleErrorSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;

beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
  consoleWarnSpy.mockRestore();
});

describe("TransactionItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders transaction info", () => {
    let transaction = makeTransaction();
    render(<TransactionItem transaction={transaction} />);
    const formattedDate = transaction.date.toDate().toLocaleDateString();
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes(transaction.description))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`€${transaction.amount}.*⬇️`))).toBeInTheDocument();
    expect(screen.getByText("✏️ Bewerken")).toBeInTheDocument();
    expect(screen.getByText("🗑️ Verwijder")).toBeInTheDocument();
  });

  it("shows TransactionForm and cancel button when editing", () => {
    render(<TransactionItem transaction={makeTransaction()} />);
    fireEvent.click(screen.getByText("✏️ Bewerken"));
    expect(screen.getByTestId("transaction-form")).toBeInTheDocument();
    expect(screen.getByText("Annuleer")).toBeInTheDocument();
  });

  it("closes form on Annuleer", () => {
    render(<TransactionItem transaction={makeTransaction()} />);
    fireEvent.click(screen.getByText("✏️ Bewerken"));
    fireEvent.click(screen.getByText("Annuleer"));
    expect(screen.queryByTestId("transaction-form")).not.toBeInTheDocument();
  });

  it("calls updateTransaction and closes form on save", async () => {
    const { updateTransaction } = require("@/services/transaction.service");
    render(<TransactionItem transaction={makeTransaction()} />);
    fireEvent.click(screen.getByText("✏️ Bewerken"));
    fireEvent.click(screen.getByText("Opslaan"));
    await waitFor(() => expect(updateTransaction).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.queryByTestId("transaction-form")).not.toBeInTheDocument()
    );
  });

  it("shows alert on updateTransaction error", async () => {
    const { updateTransaction } = require("@/services/transaction.service");
    updateTransaction.mockRejectedValueOnce(new Error("fail"));
    window.alert = jest.fn();
    render(<TransactionItem transaction={makeTransaction()} />);
    fireEvent.click(screen.getByText("✏️ Bewerken"));
    fireEvent.click(screen.getByText("Opslaan"));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Update mislukt.")
    );
  });

  it("calls deleteTransaction on confirm", async () => {
    const { deleteTransaction } = require("@/services/transaction.service");
    window.confirm = jest.fn(() => true);
    render(<TransactionItem transaction={makeTransaction()} />);
    fireEvent.click(screen.getByText("🗑️ Verwijder"));
    await waitFor(() =>
      expect(deleteTransaction).toHaveBeenCalledWith("u1", "b1", "t1")
    );
  });

  it("does not call deleteTransaction if confirm is false", async () => {
    const { deleteTransaction } = require("@/services/transaction.service");
    window.confirm = jest.fn(() => false);
    render(<TransactionItem transaction={makeTransaction()} />);
    fireEvent.click(screen.getByText("🗑️ Verwijder"));
    expect(deleteTransaction).not.toHaveBeenCalled();
  });

  it("shows alert on deleteTransaction error", async () => {
    const { deleteTransaction } = require("@/services/transaction.service");
    window.confirm = jest.fn(() => true);
    deleteTransaction.mockRejectedValueOnce(new Error("fail"));
    window.alert = jest.fn();
    render(<TransactionItem transaction={makeTransaction()} />);
    fireEvent.click(screen.getByText("🗑️ Verwijder"));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Verwijderen mislukt.")
    );
  });
});
