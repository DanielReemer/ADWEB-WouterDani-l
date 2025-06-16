import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import BookList from "@/app/books/BookList";
import { useLoading as mockUseLoading } from "@/lib/hooks/useLoading";
import { Book } from "@/lib/collections/Book";
import "@testing-library/jest-dom";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock("@/services/book.service", () => ({
  listenToBooks: jest.fn(),
}));

jest.mock("@/lib/hooks/useLoading", () => ({
  useLoading: jest.fn(() => ({
    loading: false,
    data: [],
    setLoaded: jest.fn(),
    reset: jest.fn(),
  })),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(() => ({
    user: { uid: "test-user" },
    loading: false,
  })),
}));

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("BookList component", () => {
  const listenFn = jest.fn((_userId: string, _listener: (books: Book[]) => void) => {
    return () => {};
  });

  it("renders loading skeletons when loading", () => {
    (mockUseLoading as jest.Mock).mockReturnValue({
      loading: true,
      data: [],
      setLoaded: jest.fn(),
      reset: jest.fn(),
    });
    render(<BookList listenFn={listenFn} userId="test-user-id" title="Loading boeken" />);
    expect(screen.getByText("Loading boeken")).toBeInTheDocument();
    expect(
      screen.getAllByText((_, el) => !!el?.className.includes("animate-pulse"))
    ).toHaveLength(5);
  });

  it("shows empty message when no books", () => {
    (mockUseLoading as jest.Mock).mockReturnValue({
      loading: false,
      data: [],
      setLoaded: jest.fn(),
      reset: jest.fn(),
    });
    render(<BookList listenFn={listenFn} userId="test-user-id" />);
    expect(screen.getByText("Geen boeken gevonden.")).toBeInTheDocument();
  });

  it("renders list of books with correct info and links", () => {
    const books: Book[] = [
      { id: "b1", name: "Test Boek 1", balance: 123.45 },
      { id: "b2", name: "Test Boek 2", balance: -10.0 },
      { id: "b3", name: "Test Boek 3", balance: 0 },
    ];
    (mockUseLoading as jest.Mock).mockReturnValue({
      loading: false,
      data: books,
      setLoaded: jest.fn(),
      reset: jest.fn(),
    });

    render(<BookList listenFn={listenFn} userId="test-user-id" title="Mijn Boeken" />);

    const balanceElements = screen.getAllByText("Balans:");

    expect(screen.getByText("Mijn Boeken")).toBeInTheDocument();
    expect(balanceElements).toHaveLength(books.length);

    books.forEach((book) => {
      expect(screen.getByText(book.name)).toBeInTheDocument();
      const euro = `€ ${(book.balance ?? 0).toLocaleString("nl-NL", {
        minimumFractionDigits: 2,
      })}`;
      expect(screen.getByText(euro)).toBeInTheDocument();
    });
    expect(screen.getByText("€ 123,45").className).toMatch(/text-green-600/);
    expect(screen.getByText("€ -10,00").className).toMatch(/text-red-600/);
    expect(screen.getByText("€ 0,00").className).toMatch(/text-green-600/);
  });
});