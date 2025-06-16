import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateBookPage from "@/app/books/create/page";
import { addBook } from "@/services/book.service";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/services/book.service", () => ({
  addBook: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/lib/hooks/useRequireUser", () => ({
  useRequireUser: () => ({ uid: "test-user-id" }),
}));

const fillAndSubmitForm = async (
  name = "Test Book",
  description = "Test Description"
) => {
  fireEvent.change(screen.getByLabelText(/naam\s*\*/i), {
    target: { value: name },
  });
  fireEvent.change(screen.getByLabelText("Omschrijving"), {
    target: { value: description },
  });
  fireEvent.click(screen.getByRole("button", { name: /Aanmaken/i }));
};

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
    await fillAndSubmitForm();
    expect(
      await screen.findByText(
        "Er is iets misgegaan bij het aanmaken van het boek."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Aanmaken")).not.toHaveClass("loading");
  });

  it("redirects to /books on successful book creation", async () => {
    render(<CreateBookPage />);
    await fillAndSubmitForm();
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/books");
    });
  });
});
