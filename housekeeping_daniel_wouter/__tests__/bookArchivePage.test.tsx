import React from "react";
import { render, screen } from "@testing-library/react";
import ArchivedBooksPage from "@/app/books/archive/page";
import "@testing-library/jest-dom";
import { listenToArchivedBooks } from "@/services/book.service";

jest.mock(
  "@/app/books/BookList",
  () =>
    ({ listenFn, title, children }: any) =>
      (
        <div>
          <div data-testid="booklist-title">{title}</div>
          {/* Simulate a book for render-props children */}
          {typeof children === "function" &&
            children({ id: "1", name: "Test Book", balance: 42 })}
        </div>
      )
);
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));
jest.mock("@/services/book.service", () => ({
  listenToArchivedBooks: jest.fn(),
  restoreBook: jest.fn(),
}));

describe("ArchivedBooksPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the heading and description", () => {
    render(<ArchivedBooksPage />);
    expect(
      screen.getByRole("heading", { name: /Gearchiveerde boekjes/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Hier zie je alle huishoudboekjes die je hebt gearchiveerd/i
      )
    ).toBeInTheDocument();
  });

  it("renders the back link", () => {
    render(<ArchivedBooksPage />);
    const link = screen.getByRole("link", {
      name: /Terug naar actieve boeken/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/books");
  });

  it("renders BookList with correct props", () => {
    render(<ArchivedBooksPage />);
    expect(screen.getByTestId("booklist-title")).toHaveTextContent(
      "Gearchiveerde boekjes"
    );
  });

  it("renders a mocked book with name, balance, and restore button", () => {
    render(<ArchivedBooksPage />);
    expect(screen.getByText("Test Book")).toBeInTheDocument();
    expect(screen.getByText(/Balans:/i)).toBeInTheDocument();
    expect(screen.getByText(/€\s*42,00/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Terugzetten/i })
    ).toBeInTheDocument();
  });

  it("calls restoreBook when restore button is clicked", async () => {
    const { restoreBook } = require("@/services/book.service");
    render(<ArchivedBooksPage />);
    const button = screen.getByRole("button", { name: /Terugzetten/i });
    button.click();
    expect(restoreBook).toHaveBeenCalledWith("1");
  });
});
