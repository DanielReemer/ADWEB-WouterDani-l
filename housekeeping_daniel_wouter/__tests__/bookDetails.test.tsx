import React from "react";
import { render, screen, act } from "@testing-library/react";
import BookPage from "@/app/books/[slug]/page";
import "@testing-library/jest-dom";

// Mocks
const mockReset = jest.fn();
const mockSetLoaded = jest.fn();
const mockUseLoading = jest.fn(() => ({
  loading: false,
  data: undefined as typeof exampleBook | undefined,
  setLoaded: mockSetLoaded,
  reset: mockReset,
}));
jest.mock("@/lib/hooks/useLoading", () => ({
  useLoading: () => mockUseLoading(),
}));

const mockUseParams = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: () => mockUseParams(),
}));

const mockUnsubscribe = jest.fn();
const mockListenToBook = jest.fn(() => mockUnsubscribe);
jest.mock("@/services/book.service", () => ({
  listenToBook: () => mockListenToBook(),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

jest.mock("@/app/loading", () => () => <div>LoadingMock</div>);

const exampleBook = {
  id: "abc123",
  name: "Boeknaam",
  description: "Beschrijving van het boek",
  balance: 1234.56,
};

describe("BookPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ slug: "abc123" });
  });

  it("shows loading spinner when loading", () => {
    mockUseLoading.mockReturnValueOnce({
      loading: true,
      data: undefined,
      setLoaded: mockSetLoaded,
      reset: mockReset,
    });
    render(<BookPage />);
    expect(screen.getByText("LoadingMock")).toBeInTheDocument();
  });

  it("shows 'not found' message when no book found", () => {
    mockUseLoading.mockReturnValueOnce({
      loading: false,
      data: undefined,
      setLoaded: mockSetLoaded,
      reset: mockReset,
    });
    render(<BookPage />);
    expect(screen.getByText(/geen gegevens gevonden/i)).toBeInTheDocument();
    expect(screen.getByText(/het gevraagde boek/i)).toBeInTheDocument();
  });

  it("renders book info when book is found", () => {
    mockUseLoading.mockReturnValueOnce({
      loading: false,
      data: exampleBook,
      setLoaded: mockSetLoaded,
      reset: mockReset,
    });
    render(<BookPage />);
    expect(
      screen.getByRole("heading", { name: /boeknaam/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /bewerk dit boek/i })
    ).toHaveAttribute("href", "/books/abc123/edit");
    expect(screen.getByText(/beschrijving van het boek/i)).toBeInTheDocument();
    expect(screen.getByText(/balans/i)).toBeInTheDocument();
    expect(screen.getByText("€ 1.234,56")).toBeInTheDocument();
  });

  it("renders negative balance in red", () => {
    mockUseLoading.mockReturnValueOnce({
      loading: false,
      data: { ...exampleBook, balance: -42.5 },
      setLoaded: mockSetLoaded,
      reset: mockReset,
    });
    render(<BookPage />);
    const balance = screen.getByText("€ -42,50");
    expect(balance).toBeInTheDocument();
    expect(balance).toHaveClass("text-red-600");
  });
});
