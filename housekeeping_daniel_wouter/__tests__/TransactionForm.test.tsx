import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransactionForm, { TransactionFormData } from "@/app/books/[slug]/TransactionForm";
import { Timestamp } from "firebase/firestore";
import "@testing-library/jest-dom";

jest.mock("firebase/firestore", () => ({
  Timestamp: {
    fromDate: jest.fn((date: Date) => ({
      seconds: Math.floor(date.getTime() / 1000),
      toDate: () => date,
    })),
  },
}));

const mockOnSave = jest.fn();

const initialTransaction: TransactionFormData = {
  amount: 42.5,
  description: "Lunch",
  type: "expense",
  date: {
    toDate: () => new Date("2024-05-10"),
  } as unknown as Timestamp,
};

beforeEach(() => {
  jest.clearAllMocks();
  window.alert = jest.fn();
});

it("renders form with default values", () => {
  render(<TransactionForm onSave={mockOnSave} />);
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
    "Nieuwe transactie"
  );
  expect(screen.getByLabelText(/Bedrag/i)).toHaveValue(null);
  expect(screen.getByLabelText(/Datum/i)).toHaveValue(
    new Date().toISOString().split("T")[0]
  );
  expect(screen.getByLabelText(/Beschrijving/i)).toHaveValue("");
  expect(screen.getByLabelText(/Type/i)).toHaveValue("expense");
  expect(screen.getByRole("button")).toHaveTextContent("Toevoegen");
});

it("renders with provided formTitle and submitLabel", () => {
  render(
    <TransactionForm
      onSave={mockOnSave}
      formTitle="Bewerken"
      submitLabel="Opslaan"
    />
  );
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
    "Bewerken"
  );
  expect(screen.getByRole("button")).toHaveTextContent("Opslaan");
});

it("renders initialTransaction data", () => {
  render(
    <TransactionForm
      onSave={mockOnSave}
      initialTransaction={initialTransaction}
    />
  );
  expect(screen.getByLabelText(/Bedrag/i)).toHaveValue(42.5);
  expect(screen.getByLabelText(/Datum/i)).toHaveValue("2024-05-10");
  expect(screen.getByLabelText(/Beschrijving/i)).toHaveValue("Lunch");
  expect(screen.getByLabelText(/Type/i)).toHaveValue("expense");
});

it("calls onSave with correct data for valid input", async () => {
  render(<TransactionForm onSave={mockOnSave} />);
  fireEvent.change(screen.getByLabelText(/Bedrag/i), {
    target: { value: "100" },
  });
  fireEvent.change(screen.getByLabelText(/Datum/i), {
    target: { value: "2024-01-20" },
  });
  fireEvent.change(screen.getByLabelText(/Beschrijving/i), {
    target: { value: "Test" },
  });
  fireEvent.change(screen.getByLabelText(/Type/i), {
    target: { value: "income" },
  });

  mockOnSave.mockResolvedValueOnce(undefined);

  fireEvent.click(screen.getByRole("button"));

  await waitFor(() => expect(mockOnSave).toHaveBeenCalledTimes(1));
  const callArg = mockOnSave.mock.calls[0][0];
  expect(callArg.amount).toBe(100);
  expect(callArg.description).toBe("Test");
  expect(callArg.type).toBe("income");
  expect(callArg.date).toHaveProperty(
    "seconds",
    Math.floor(new Date("2024-01-20").getTime() / 1000)
  );
});

it("resets form after submit if not editing", async () => {
  render(<TransactionForm onSave={mockOnSave} />);
  fireEvent.change(screen.getByLabelText(/Bedrag/i), {
    target: { value: "55" },
  });
  fireEvent.change(screen.getByLabelText(/Beschrijving/i), {
    target: { value: "Refund" },
  });
  mockOnSave.mockResolvedValueOnce(undefined);

  fireEvent.click(screen.getByRole("button"));

  await waitFor(() => expect(mockOnSave).toHaveBeenCalled());
  expect(screen.getByLabelText(/Bedrag/i)).toHaveValue(null);
  expect(screen.getByLabelText(/Beschrijving/i)).toHaveValue("");
  expect(screen.getByLabelText(/Type/i)).toHaveValue("expense");
});

it("does not reset form after submit if editing", async () => {
  render(
    <TransactionForm
      onSave={mockOnSave}
      initialTransaction={initialTransaction}
    />
  );
  fireEvent.change(screen.getByLabelText(/Bedrag/i), {
    target: { value: "55" },
  });
  mockOnSave.mockResolvedValueOnce(undefined);

  fireEvent.click(screen.getByRole("button"));

  await waitFor(() => expect(mockOnSave).toHaveBeenCalled());
  expect(screen.getByLabelText(/Bedrag/i)).toHaveValue(55);
});

it("shows alert if amount is empty or invalid", async () => {
  render(<TransactionForm onSave={mockOnSave} />);
  const amountInput = screen.getByLabelText(/Bedrag/i);
  amountInput.removeAttribute("required");
  amountInput.removeAttribute("min");
  amountInput.removeAttribute("step");
  
  fireEvent.click(screen.getByRole("button"));

  await waitFor(() =>
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringMatching(/geldig bedrag/i)
    )
  );
  expect(mockOnSave).not.toHaveBeenCalled();

  fireEvent.change(screen.getByLabelText(/Bedrag/i), {
    target: { value: "-100" },
  });
  fireEvent.click(screen.getByRole("button"));

  await waitFor(() =>
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringMatching(/geldig bedrag/i)
    )
  );
  expect(mockOnSave).not.toHaveBeenCalled();
});

it("shows alert if date is empty", async () => {
  render(<TransactionForm onSave={mockOnSave} />);
  fireEvent.change(screen.getByLabelText(/Bedrag/i), {
    target: { value: "50" },
  });
  fireEvent.change(screen.getByLabelText(/Datum/i), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button"));

  await waitFor(() =>
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringMatching(/geldige datum/i)
    )
  );
  expect(mockOnSave).not.toHaveBeenCalled();
});

it("shows alert if type is empty", async () => {
  render(<TransactionForm onSave={mockOnSave} />);
  fireEvent.change(screen.getByLabelText(/Bedrag/i), {
    target: { value: "10" },
  });
  fireEvent.change(screen.getByLabelText(/Type/i), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button"));

  await waitFor(() =>
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringMatching(/type transactie/i)
    )
  );
  expect(mockOnSave).not.toHaveBeenCalled();
});

it("disables submit button while saving", async () => {
  let resolvePromise: () => void;
  const onSavePromise = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });
  mockOnSave.mockReturnValueOnce(onSavePromise);

  render(<TransactionForm onSave={mockOnSave} />);
  fireEvent.change(screen.getByLabelText(/Bedrag/i), {
    target: { value: "12" },
  });
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button")).toBeDisabled();

  resolvePromise!();
  await waitFor(() => expect(screen.getByRole("button")).not.toBeDisabled());
});

it("shows alert if onSave throws", async () => {
  mockOnSave.mockRejectedValueOnce(new Error("fail"));
  render(<TransactionForm onSave={mockOnSave} />);
  fireEvent.change(screen.getByLabelText(/Bedrag/i), {
    target: { value: "20" },
  });
  fireEvent.click(screen.getByRole("button"));

  await waitFor(() =>
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringMatching(/opslaan van de transactie/i)
    )
  );
});
