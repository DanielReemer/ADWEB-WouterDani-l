import { filterTransactionsByMonth } from "../src/lib/filterTransactions";
import Transaction from "../src/lib/collections/Transaction";

describe("filterTransactionsByMonth", () => {
  it("filters only transactions from selected month", () => {

    const transactions: Transaction[] = [
      {
        id: "1",
        amount: 10,
        type: "income",
        date: { seconds: new Date("2024-01-05").getTime() / 1000 },
        description: "Income in January",
      },
      {
        id: "2",
        amount: 15,
        type: "expense",
        date: { seconds: new Date("2024-02-10").getTime() / 1000 }, // Feb
        description: "Expense in February",
      },
    ];

    const result = filterTransactionsByMonth(transactions, 1, 2024); // Feb = 1 (0-indexed)
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });
});
