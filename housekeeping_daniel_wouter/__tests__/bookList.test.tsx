import { render, screen } from "@testing-library/react";
import BookList from "@/app/books/BookList";
import "@testing-library/jest-dom";
import { Book } from "@/lib/collections/Book";
import React from "react";

const books: Book[] = [
  {
    id: "1",
    name: "Boek 1",
    balance: 150.25,
  },
  {
    id: "2",
    name: "Boek 2",
    balance: -25.5,
  },
];

describe("BookList", () => {
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
  
  it("renders message when books array is empty", () => {
    render(<BookList books={[]} />);
    expect(screen.getByText("Geen boeken gevonden.")).toBeInTheDocument();
  });

  it("renders message when books is empty", () => {
    render(<BookList books={[]} />);
    expect(screen.getByText("Geen boeken gevonden.")).toBeInTheDocument();
  });

  it("renders default title", () => {
    render(<BookList books={books} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Boekenlijst"
    );
  });

  it("renders custom title", () => {
    render(<BookList books={books} title="Mijn Boeken" />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Mijn Boeken"
    );
  });

  it("renders each book's name", () => {
    render(<BookList books={books} />);
    expect(screen.getByText("Boek 1")).toBeInTheDocument();
    expect(screen.getByText("Boek 2")).toBeInTheDocument();
  });

  it("renders positive and negative balances with correct color and format", () => {
    render(<BookList books={books} />);
    const posBalance = screen.getByText(
      (_, node) => node?.textContent?.replace(/\s+/g, "") === "€150,25"
    );
    const negBalance = screen.getByText(
      (_, node) => node?.textContent?.replace(/\s+/g, "") === "€-25,50"
    );
    expect(posBalance).toHaveClass("text-green-600");
    expect(negBalance).toHaveClass("text-red-600");
  });

  it("renders children when function is provided", () => {
    render(
      <BookList books={books}>
        {(book) => (
          <span data-testid={`custom-${book.id}`}>{book.name}-custom</span>
        )}
      </BookList>
    );
    expect(screen.getByTestId("custom-1")).toHaveTextContent("Boek 1-custom");
    expect(screen.getByTestId("custom-2")).toHaveTextContent("Boek 2-custom");
  });

  it("renders nothing for balance if not a number", () => {
    const booksNoBalance: Book[] = [{ id: "3", name: "Boek 3" }];
    render(<BookList books={booksNoBalance} />);
    expect(screen.getByText("Boek 3")).toBeInTheDocument();
    expect(screen.queryByText(/Balans/)).not.toBeInTheDocument();
  });
});
