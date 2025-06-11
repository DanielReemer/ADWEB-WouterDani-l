import React from "react";
import { render, screen } from "@testing-library/react";
import BookPage from "@/app/books/page";
import "@testing-library/jest-dom";

jest.mock("@/app/books/BookList", () => () => <div>BookListMock</div>);
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

describe("BookPage", () => {
  it("renders the heading", () => {
    render(<BookPage />);
    expect(
      screen.getByRole("heading", { name: /huishoudboekjes/i })
    ).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<BookPage />);
    expect(
      screen.getByText(/hier vind je een overzicht van al jouw boeken/i)
    ).toBeInTheDocument();
  });

  it("renders the create book link", () => {
    render(<BookPage />);
    const link = screen.getByRole("link", { name: /nieuw boek toevoegen/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/books/create");
  });

  it("renders the BookList component", () => {
    render(<BookPage />);
    expect(screen.getByText("BookListMock")).toBeInTheDocument();
  });
});
