import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ArchivedBooksPage from "@/app/books/archive/page";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { listenToArchivedBooks } from "@/services/archivedBook.service";
import { restoreBook } from "@/services/bookArchive.service";
import "@testing-library/jest-dom";

jest.mock("@/lib/hooks/useRequireUser", () => ({
  useRequireUser: jest.fn(),
}));

jest.mock("@/services/archivedBook.service", () => ({
  listenToArchivedBooks: jest.fn(),
}));

jest.mock("@/services/bookArchive.service", () => ({
  restoreBook: jest.fn(),
}));

const mockUser = { uid: "user-123" };
const mockBooks = [
  { id: "1", name: "Boek 1", balance: 100 },
  { id: "2", name: "Boek 2", balance: -50 },
];

describe("ArchivedBooksPage", () => {
  let consoleErrorSpy: jest.SpyInstance;
  
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });


  beforeEach(() => {
    jest.clearAllMocks();
    (useRequireUser as jest.Mock).mockReturnValue(mockUser);
    (listenToArchivedBooks as jest.Mock).mockImplementation((_uid, cb) => {
      cb(mockBooks);
      return jest.fn();
    });
    (restoreBook as jest.Mock).mockResolvedValue(undefined);
  });

  it("renders header and description", () => {
    render(<ArchivedBooksPage />);
    expect(
      screen.getAllByRole("heading", { name: /gearchiveerde boekjes/i })[0]
    ).toBeInTheDocument();
    expect(
      screen.getByText(/huishoudboekjes die je hebt gearchiveerd/i)
    ).toBeInTheDocument();
  });

  it("renders link to active books", () => {
    render(<ArchivedBooksPage />);
    expect(
      screen.getByRole("link", { name: /terug naar actieve boeken/i })
    ).toHaveAttribute("href", "/books");
  });

  it("renders books with correct info and balance colors", () => {
    render(<ArchivedBooksPage />);
    expect(screen.getByText("Boek 1")).toBeInTheDocument();
    expect(screen.getByText("Boek 2")).toBeInTheDocument();
    expect(screen.getAllByText(/balans:/i)).toHaveLength(2);
    expect(
      screen.getByText("€ 100,00").className.includes("text-green-600")
    ).toBe(true);
    expect(
      screen.getByText("€ -50,00").className.includes("text-red-600")
    ).toBe(true);
  });

  it("calls restoreBook with correct args when restore button is clicked", async () => {
    render(<ArchivedBooksPage />);
    const restoreButtons = screen.getAllByRole("button", {
      name: /terugzetten/i,
    });
    fireEvent.click(restoreButtons[0]);
    await waitFor(() =>
      expect(restoreBook).toHaveBeenCalledWith("user-123", "1")
    );
  });

  it("handles restoreBook errors gracefully", async () => {
    (restoreBook as jest.Mock).mockRejectedValue(new Error("fail"));
    render(<ArchivedBooksPage />);
    const restoreButtons = screen.getAllByRole("button", {
      name: /terugzetten/i,
    });
    fireEvent.click(restoreButtons[0]);
    await waitFor(() =>
      expect(restoreBook).toHaveBeenCalledWith("user-123", "1")
    );
  });

  it("listens to archived books on mount and unsubscribes on unmount", () => {
    const unsubscribe = jest.fn();
    (listenToArchivedBooks as jest.Mock).mockImplementation((_uid, cb) => {
      cb(mockBooks);
      return unsubscribe;
    });
    const { unmount } = render(<ArchivedBooksPage />);
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
