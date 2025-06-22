import { render, screen } from "@testing-library/react";
import BookDetails from "@/app/books/[slug]/BookDetails";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import Link from "next/link";
import '@testing-library/jest-dom';

jest.mock("next/link", () => {
  return ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
});

jest.mock("@/lib/hooks/useRequireUser", () => ({
  useRequireUser: jest.fn(),
}));

describe("BookDetails", () => {
  const mockBook = {
    id: "book1",
    name: "Test Book",
    description: "This is a test book description.",
    ownerId: "testUserId",
  };

  const mockBalance = 123.45;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the book name and description", () => {
    (useRequireUser as jest.Mock).mockReturnValue({ uid: "testUserId" });

    render(<BookDetails book={mockBook} balance={mockBalance} />);

    expect(screen.getByText("Test Book")).toBeInTheDocument();
    expect(screen.getByText("Beschrijving")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test book description.")
    ).toBeInTheDocument();
  });

  it("renders the balance with correct formatting", () => {
    (useRequireUser as jest.Mock).mockReturnValue({ uid: "testUserId" });

    render(<BookDetails book={mockBook} balance={mockBalance} />);

    expect(screen.getByText("Balans")).toBeInTheDocument();
    expect(screen.getByText("€ 123,45")).toBeInTheDocument();
  });

  it("renders a negative balance in red", () => {
    (useRequireUser as jest.Mock).mockReturnValue({ uid: "testUserId" });

    render(<BookDetails book={mockBook} balance={-50.67} />);

    expect(screen.getByText("€ -50,67")).toHaveClass("text-red-600");
  });

  it("renders a positive balance in green", () => {
    (useRequireUser as jest.Mock).mockReturnValue({ uid: "testUserId" });

    render(<BookDetails book={mockBook} balance={50.67} />);

    expect(screen.getByText("€ 50,67")).toHaveClass("text-green-600");
  });

  it("renders the edit link if user is the owner", () => {
    (useRequireUser as jest.Mock).mockReturnValue({ uid: "testUserId" });

    render(<BookDetails book={mockBook} balance={mockBalance} />);

    const editLink = screen.getByText("Bewerk dit boek");
    expect(editLink).toBeInTheDocument();
    expect(editLink).toHaveAttribute("href", "/books/book1/edit");
  });

  it("does not render the edit link if user is not the owner", () => {
    (useRequireUser as jest.Mock).mockReturnValue({ uid: "anotherUserId" });

    render(<BookDetails book={mockBook} balance={mockBalance} />);

    expect(screen.queryByText("Bewerk dit boek")).not.toBeInTheDocument();
  });

  it("does not render the description section if description is empty", () => {
    (useRequireUser as jest.Mock).mockReturnValue({ uid: "testUserId" });

    render(
      <BookDetails
        book={{ ...mockBook, description: "" }}
        balance={mockBalance}
      />
    );

    expect(screen.queryByText("Beschrijving")).not.toBeInTheDocument();
  });

  it("does not render the balance section if balance is undefined", () => {
    (useRequireUser as jest.Mock).mockReturnValue({ uid: "testUserId" });

    render(
      <BookDetails book={mockBook} balance={undefined as unknown as number} />
    );

    expect(screen.queryByText("Balans")).not.toBeInTheDocument();
  });
});
