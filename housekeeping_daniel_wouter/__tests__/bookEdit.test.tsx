import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditBookPage from "@/app/books/[slug]/edit/page";
import { updateBook, listenToBook } from "@/services/book.service";

const pushMock = jest.fn();
const useParamsMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useParams: () => useParamsMock(),
}));

jest.mock("@/services/book.service", () => ({
  updateBook: jest.fn(() => Promise.resolve()),
  listenToBook: jest.fn(),
}));

jest.mock("@/app/loading", () => () => <div>LoadingMock</div>);

describe("EditBookPage", () => {
  let consoleErrorSpy: jest.SpyInstance;
  const testBook = {
    id: "book-123",
    name: "Mijn Boek",
    description: "Beschrijving",
    balance: 100,
  };

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useParamsMock.mockReturnValue({ slug: "book-123" });
  });

  it("renders loading initially", () => {
    (listenToBook as jest.Mock).mockImplementation(() => () => {});
    render(<EditBookPage />);
    expect(screen.getByText(/LoadingMock/i)).toBeInTheDocument();
  });

  it("renders error if book not found", () => {
    (listenToBook as jest.Mock).mockImplementation((_slug, callback) => {
      callback(undefined);
      return () => {};
    });
    render(<EditBookPage />);
    expect(screen.getByText(/boek niet gevonden/i)).toBeInTheDocument();
  });

  it("renders BookForm with initial book data and submits update", async () => {
    (listenToBook as jest.Mock).mockImplementation((_slug, callback) => {
      callback(testBook);
      return () => {};
    });
    render(<EditBookPage />);
    const nameInput = screen.getByLabelText(/naam\s*\*/i);
    const descriptionInput = screen.getByLabelText("Omschrijving");
    const submitButton = screen.getByRole("button", { name: /Opslaan/i });

    expect(nameInput).toHaveValue(testBook.name);
    expect(descriptionInput).toHaveValue(testBook.description);

    fireEvent.change(nameInput, { target: { value: "Aangepast Boek" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Nieuwe beschrijving" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateBook).toHaveBeenCalledWith("book-123", {
        name: "Aangepast Boek",
        description: "Nieuwe beschrijving",
      });
      expect(pushMock).toHaveBeenCalledWith("/books/book-123");
    });
  });

  it("shows global error if updateBook fails", async () => {
    (listenToBook as jest.Mock).mockImplementation((_slug, callback) => {
      callback(testBook);
      return () => {};
    });
    (updateBook as jest.Mock).mockRejectedValueOnce(new Error("fail"));

    render(<EditBookPage />);
    const submitButton = screen.getByRole("button", { name: /Opslaan/i });
    fireEvent.click(submitButton);

    await screen.findByText("Kon het boek niet updaten.");
    expect(screen.getByText("Kon het boek niet updaten.")).toBeInTheDocument();
  });
});
