import { render, screen } from "@testing-library/react";
import TransactionList from "../src/app/dashboard/TransactionList";
import "@testing-library/jest-dom";

// Mock de TransactionItem component (we willen TransactionList testen, niet de inhoud van elk item)
jest.mock("../src/app/dashboard/TransactionItem", () => ({
  __esModule: true,
  default: ({ transaction }: any) => (
    <li data-testid="transaction-item">{transaction.description}</li>
  ),
}));

describe("TransactionList", () => {
  it("toont een lege melding als er geen transacties zijn", () => {
    render(<TransactionList transactions={[]} />);
    expect(
      screen.getByText(/geen transacties deze maand/i)
    ).toBeInTheDocument();
  });

  it("toont een lijst met transacties", () => {
    const transactions = [
      {
        id: "1",
        description: "Huur",
        amount: 800,
        type: "expense" as const,
        date: { seconds: 1710000000 },
      },
      {
        id: "2",
        description: "Salaris",
        amount: 2500,
        type: "income" as const,
        date: { seconds: 1710500000 },
      },
    ];

    render(<TransactionList transactions={transactions} />);

    // Check of alle items gerenderd worden
    const items = screen.getAllByTestId("transaction-item");
    expect(items).toHaveLength(2);

    // Extra check op de tekstinhoud
    expect(screen.getByText("Huur")).toBeInTheDocument();
    expect(screen.getByText("Salaris")).toBeInTheDocument();
  });
});
