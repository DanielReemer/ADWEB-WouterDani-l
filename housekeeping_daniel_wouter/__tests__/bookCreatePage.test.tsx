import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateBookPage from "@/app/books/create/page";
import { addBook } from "@/services/book.service";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock("@/services/book.service", () => ({
  addBook: jest.fn(() => Promise.resolve()),
}));

describe("CreateBookPage", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows global error on book creation failure", async () => {
    (addBook as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Network Error"))
    );

    render(<CreateBookPage />);

    // Simulate form submission
    const nameInput = screen.getByLabelText(/naam\s*\*/i);
    const descriptionInput = screen.getByLabelText("Omschrijving");
    const submitButton = screen.getByRole("button", { name: /Aanmaken/i });

    // Fill in the form
    fireEvent.change(nameInput, { target: { value: "Test Book" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test Description" },
    });

    // Click the submit button
    fireEvent.click(submitButton);

    // Wait for global error message to appear
    await screen.findByText(
      "Er is iets misgegaan bij het aanmaken van het boek."
    );
    expect(
      screen.getByText("Er is iets misgegaan bij het aanmaken van het boek.")
    ).toBeInTheDocument();
    expect(screen.getByText("Aanmaken")).not.toHaveClass("loading");
  });

  it("redirects to /books on successful book creation", async () => {
    render(<CreateBookPage />);

    // Simulate form submission
    const nameInput = screen.getByLabelText(/naam\s*\*/i);
    const descriptionInput = screen.getByLabelText("Omschrijving");
    const submitButton = screen.getByRole("button", { name: /Aanmaken/i });

    // Fill in the form
    fireEvent.change(nameInput, { target: { value: "Test Book" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test Description" },
    });

    // Click the submit button
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/books");
    });
  });
});
