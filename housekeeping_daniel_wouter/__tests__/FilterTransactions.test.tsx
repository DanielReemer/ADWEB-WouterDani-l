import { filterTransactionsByMonth } from "../src/lib/utils/filterTransactions";
import Transaction from "../src/lib/collections/Transaction";
import { Timestamp } from "firebase/firestore";

describe("filterTransactionsByMonth", () => {
  it("filters only transactions from selected month", () => {

    const transactions: Transaction[] = [
      {
        id: "1",
        amount: 10,
        type: "income",
        date: Timestamp.fromDate(new Date("2024-01-05")),
        description: "Income in January",
        userId: "user1",
        bookId: "book1",
        categoryId: null,
      },
      {
        id: "2",
        amount: 15,
        type: "expense",
        date: Timestamp.fromDate(new Date("2024-02-10")), // Feb
        description: "Expense in February",
        userId: "user1",
        bookId: "book1",
        categoryId: null,
      },
    ];

    const result = filterTransactionsByMonth(transactions, 1, 2024); // Feb = 1 (0-indexed)
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });
});
