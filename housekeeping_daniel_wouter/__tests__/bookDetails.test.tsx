import { render, screen } from "@testing-library/react";
import BookDetails from "@/app/books/[slug]/BookDetails";
import { Book } from "@/lib/collections/Book";
import "@testing-library/jest-dom";

jest.mock("next/link", () => ({ children, href, className }: any) => (
  <a href={href} className={className} data-testid="link">
    {children}
  </a>
));

const baseBook: Book = {
  id: "b1",
  name: "Testboek",
};

it("renders book name and edit link", () => {
  render(<BookDetails book={baseBook} balance={0} />);
  expect(screen.getByText("Testboek")).toBeInTheDocument();
  const link = screen.getByTestId("link");
  expect(link).toHaveAttribute("href", "/books/b1/edit");
  expect(link).toHaveTextContent("Bewerk dit boek");
});

it("renders description if present", () => {
  render(
    <BookDetails
      book={{
        ...baseBook,
        description: "Beschrijving tekst",
      }}
      balance={0}
    />
  );
  expect(screen.getByText("Beschrijving tekst")).toBeInTheDocument();
  expect(screen.getByText("Beschrijving")).toBeInTheDocument();
});

it("does not render description block if description not present", () => {
  render(<BookDetails book={baseBook} balance={0} />);
  expect(screen.queryByText("Beschrijving")).not.toBeInTheDocument();
});

it("renders green balance if positive", () => {
  render(<BookDetails book={baseBook} balance={150.75} />);
  expect(screen.getByText("Balans")).toBeInTheDocument();
  const balance = screen.getByText(/€\s+150,75/);
  expect(balance).toBeInTheDocument();
  expect(balance).toHaveClass("text-green-600");
});

it("renders red balance if negative", () => {
  render(<BookDetails book={baseBook} balance={-42} />);
  const balance = screen.getByText(/€\s+-42,00/);
  expect(balance).toHaveClass("text-red-600");
});

it("does not render balance block if balance is undefined", () => {
  // @ts-expect-error purposely omitting balance to test fallback
  render(<BookDetails book={baseBook} />);
  expect(screen.queryByText("Balans")).not.toBeInTheDocument();
});
