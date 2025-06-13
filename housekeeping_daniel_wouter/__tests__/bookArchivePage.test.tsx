import React from "react";
import { render, screen } from "@testing-library/react";
import ArchivedBooksPage from "@/app/books/archive/page";
import "@testing-library/jest-dom";
import { listenToArchivedBooks } from "@/services/archivedBook.service";
import { restoreBook } from "@/services/bookArchive.service";

const TEST_USER_ID = "test-user-id";

jest.mock(
  "@/app/books/BookList",
  () =>
    ({ listenFn, title, children }: any) =>
      (
        <div>
          <div data-testid="booklist-title">{title}</div>
          {typeof children === "function" &&
            children({ id: "1", name: "Test Book", balance: 42 })}
        </div>
      )
);

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

jest.mock("@/services/bookArchive.service", () => ({
  restoreBook: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/services/archivedBook.service", () => ({
  listenToArchivedBooks: jest.fn(() => (callback: any) => {
    callback([
      { id: "1", name: "Test Book", balance: 42 },
      { id: "2", name: "Another Book", balance: 100 },
    ]);
    return () => {};
  }),
}));

jest.mock("@/lib/hooks/useRequireUser", () => ({
  useRequireUser: () => ({ uid: TEST_USER_ID }),
}));

const renderPage = () => render(<ArchivedBooksPage />);
const getRestoreButton = () =>
  screen.getByRole("button", { name: /Terugzetten/i });

describe("ArchivedBooksPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the heading and description", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Gearchiveerde boekjes/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Hier zie je alle huishoudboekjes die je hebt gearchiveerd/i)
    ).toBeInTheDocument();
  });

  it("renders the back link", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /Terug naar actieve boeken/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/books");
  });

  it("renders BookList with correct props", () => {
    renderPage();
    expect(screen.getByTestId("booklist-title")).toHaveTextContent("Gearchiveerde boekjes");
  });

  it("renders a mocked book with name, balance, and restore button", () => {
    renderPage();
    expect(screen.getByText("Test Book")).toBeInTheDocument();
    expect(screen.getByText(/Balans:/i)).toBeInTheDocument();
    expect(screen.getByText(/€\s*42,00/)).toBeInTheDocument();
    expect(getRestoreButton()).toBeInTheDocument();
  });

  it("calls restoreBook when restore button is clicked", () => {
    renderPage();
    getRestoreButton().click();
    expect(restoreBook).toHaveBeenCalledWith(TEST_USER_ID, "1");
  });
});