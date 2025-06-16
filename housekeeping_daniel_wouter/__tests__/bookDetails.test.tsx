import { render, screen } from "@testing-library/react";
import BookPage from "@/app/books/[slug]/page";
import "@testing-library/jest-dom";

const mockReset = jest.fn();
const mockSetLoaded = jest.fn();
const mockUseLoading = jest.fn();
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

jest.mock("@/lib/hooks/useRequireUser", () => ({
  useRequireUser: () => ({ uid: "test-user-id" }),
}));

type ExampleBook = {
  id: string;
  name: string;
  description: string;
  balance: number;
};

const exampleBook: ExampleBook = {
  id: "abc123",
  name: "Boeknaam",
  description: "Beschrijving van het boek",
  balance: 1234.56,
};

const renderPage = (
  loading: boolean = false,
  data: ExampleBook | undefined = undefined
) => {
  mockUseLoading.mockReturnValue({
    loading,
    data,
    setLoaded: mockSetLoaded,
    reset: mockReset,
  });
  render(<BookPage />);
};

describe("BookPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ slug: "abc123" });
  });

  it("shows loading spinner when loading", () => {
    renderPage(true);
    expect(screen.getByText("LoadingMock")).toBeInTheDocument();
  });

  it("shows 'not found' message when no book found", () => {
    renderPage(false, undefined);
    expect(screen.getByText(/geen gegevens gevonden/i)).toBeInTheDocument();
    expect(screen.getByText(/het gevraagde boek/i)).toBeInTheDocument();
  });

  it("renders book info when book is found", () => {
    renderPage(false, exampleBook);
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
    renderPage(false, { ...exampleBook, balance: -42.5 });
    const balance = screen.getByText("€ -42,50");
    expect(balance).toBeInTheDocument();
    expect(balance).toHaveClass("text-red-600");
  });
});
