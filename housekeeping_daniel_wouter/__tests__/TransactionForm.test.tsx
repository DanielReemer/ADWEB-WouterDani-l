import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransactionForm from "../src/app/dashboard/TransactionForm";
import { addDoc, collection } from "firebase/firestore";

jest.mock("../src/firebase", () => ({
  db: {},
}));

jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
}));

describe("TransactionForm - Happy Flow", () => {
  it("slaat een geldige transactie op", async () => {
    const handleSave = jest.fn();
    const mockAddDoc = addDoc as jest.Mock;

    render(<TransactionForm onSave={handleSave} />);

    fireEvent.change(screen.getByLabelText(/bedrag/i), {
      target: { value: "45.99" },
    });

    fireEvent.change(screen.getByLabelText(/datum/i), {
      target: { value: "2024-04-20" },
    });

    fireEvent.change(screen.getByLabelText(/beschrijving/i), {
      target: { value: "Testtransactie" },
    });

    fireEvent.change(screen.getByLabelText(/type/i), {
      target: { value: "income" },
    });

    fireEvent.click(screen.getByRole("button", { name: /toevoegen/i }));

    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalled();
      expect(handleSave).toHaveBeenCalled();
    });
  });
});
