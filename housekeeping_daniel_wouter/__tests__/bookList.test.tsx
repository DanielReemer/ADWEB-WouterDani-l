import React from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import BookList from "@/app/books/BookList";
import { listenToBooks as mockListenToBooks } from "@/services/book.service";
import { useLoading as mockUseLoading } from "@/lib/hooks/useLoading";
import { Book } from "@/lib/collections/Book";
import "@testing-library/jest-dom";

jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

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

describe("BookList component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  function setupUseLoading({
    loading = false,
    data = [],
    setLoaded = jest.fn(),
    reset = jest.fn(),
  }: Partial<ReturnType<typeof mockUseLoading>>) {
    (mockUseLoading as jest.Mock).mockReturnValue({
      loading,
      data,
      setLoaded,
      reset,
    });
    return { setLoaded, reset };
  }

  function mockListen(unsubscribeFn = jest.fn()) {
    (mockListenToBooks as jest.Mock).mockImplementation(
      (_listener) => unsubscribeFn
    );
    return unsubscribeFn;
  }

  it("renders loading skeletons when loading", () => {
    setupUseLoading({ loading: true, data: undefined });
    mockListen();

    render(<BookList />);

    expect(screen.getByText("Boekenlijst")).toBeInTheDocument();
    expect(
      screen.getAllByText(
        (_content, element) =>
          element?.className.includes("animate-pulse") || false
      )
    ).toHaveLength(5);
  });

  it("shows empty message when no books", () => {
    setupUseLoading({ loading: false, data: [] });
    mockListen();

    render(<BookList />);

    expect(screen.getByText("Geen boeken gevonden.")).toBeInTheDocument();
  });

  it("renders list of books with correct info and links", () => {
    const books: Book[] = [
      { id: "1", name: "Boek A", balance: 100 },
      { id: "2", name: "Boek B", balance: -50 },
    ];
    setupUseLoading({ loading: false, data: books });
    mockListen();

    render(<BookList />);

    expect(screen.getByText("Boekenlijst")).toBeInTheDocument();
    expect(screen.getByText("Boek A")).toBeInTheDocument();
    expect(screen.getByText("Boek B")).toBeInTheDocument();
    expect(screen.getByText(/€\s?100,00/)).toHaveClass("text-green-600");
    expect(screen.getByText(/€\s?-50,00/)).toHaveClass("text-red-600");
    expect(screen.getByText("Boek A").closest("a")).toHaveAttribute(
      "href",
      "/books/1"
    );
    expect(screen.getByText("Boek B").closest("a")).toHaveAttribute(
      "href",
      "/books/2"
    );
  });

  it("does not render balance section if balance is not a number", () => {
    const books: Book[] = [
      { id: "1", name: "Boek C", balance: undefined as any },
      { id: "2", name: "Boek D" } as any,
    ];
    setupUseLoading({ loading: false, data: books });
    mockListen();

    render(<BookList />);

    expect(screen.getByText("Boek C")).toBeInTheDocument();
    expect(screen.getByText("Boek D")).toBeInTheDocument();
    expect(screen.queryByText(/Balans:/)).not.toBeInTheDocument();
  });

  it("calls listenToBooks and handles unsubscription on unmount", () => {
    const unsubscribe = jest.fn();
    mockListen(unsubscribe);
    const { reset } = setupUseLoading({ loading: true });

    const { unmount } = render(<BookList />);
    expect(reset).toHaveBeenCalled();

    expect(mockListenToBooks).toHaveBeenCalledTimes(1);

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("updates the books when listenToBooks yields data", () => {
    let callback: (books: Book[]) => void = () => {};
    (mockListenToBooks as jest.Mock).mockImplementation((cb: any) => {
      callback = cb;
      return jest.fn();
    });

    const setLoaded = jest.fn();
    setupUseLoading({ loading: true, setLoaded });

    render(<BookList />);

    act(() => {
      callback([{ id: "1", name: "Boek X", balance: 10 }]);
    });

    expect(setLoaded).toHaveBeenCalledWith([
      { id: "1", name: "Boek X", balance: 10 },
    ]);
  });
});
