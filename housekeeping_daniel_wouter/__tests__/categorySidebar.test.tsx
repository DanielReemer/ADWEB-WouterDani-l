import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CategorySidebar from "@/app/books/[slug]/CategorySidebar";
import * as categoryService from "@/services/category.service";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useParams: () => ({ slug: "book1" }),
}));

jest.mock("@/services/category.service");

const mockCategories = [
  { id: "cat1", name: "Food", budget: 100, bookId: "book1" },
  { id: "cat2", name: "Transport", budget: 50, bookId: "book1" },
];

const mockTransactions = [
  { id: "t1", amount: 30, type: "expense", categoryId: "cat1" },
  { id: "t2", amount: 10, type: "expense", categoryId: "cat2" },
  { id: "t3", amount: 5, type: "income", categoryId: "cat1" },
];

describe("CategorySidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (categoryService.getCategories as jest.Mock).mockImplementation((slug, cb) => {
      cb(mockCategories);
      return jest.fn();
    });
  });

  it("renders categories and spent/remaining", () => {
    render(<CategorySidebar transactions={mockTransactions as any} />);
    expect(screen.getByText("Categorieën")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Transport")).toBeInTheDocument();
    expect(screen.getByText("Budget: €100.00")).toBeInTheDocument();
    expect(screen.getByText("Budget: €50.00")).toBeInTheDocument();
    expect(screen.getByText("Nog €70.00 beschikbaar")).toBeInTheDocument();
    expect(screen.getByText("Nog €40.00 beschikbaar")).toBeInTheDocument();
  });

  it("can add a category", async () => {
    (categoryService.addCategory as jest.Mock).mockResolvedValue({});
    render(<CategorySidebar transactions={[]} />);
    fireEvent.change(screen.getByPlaceholderText("Categorie Naam"), {
      target: { value: "Health" },
    });
    fireEvent.change(screen.getByPlaceholderText("Budget (€)"), {
      target: { value: "200" },
    });
    fireEvent.click(screen.getByText("➕ Toevoegen"));
    await waitFor(() =>
      expect(categoryService.addCategory).toHaveBeenCalledWith({
        id: "",
        name: "Health",
        budget: 200,
        bookId: "book1",
      })
    );
  });

  it("can start and cancel editing a category", () => {
    render(<CategorySidebar transactions={[]} />);
    fireEvent.click(screen.getAllByText("✏️")[0]);
    expect(screen.getByDisplayValue("Food")).toBeInTheDocument();
    expect(screen.getByText("✔︎ Opslaan")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Annuleer"));
    expect(screen.queryByText("✔︎ Opslaan")).not.toBeInTheDocument();
  });

  it("can save an edited category", async () => {
    (categoryService.updateCategory as jest.Mock).mockResolvedValue({});
    render(<CategorySidebar transactions={[]} />);
    fireEvent.click(screen.getAllByText("✏️")[0]);
    fireEvent.change(screen.getByDisplayValue("Food"), {
      target: { value: "Groceries" },
    });
    fireEvent.change(screen.getByDisplayValue("100"), {
      target: { value: "120" },
    });
    fireEvent.click(screen.getByText("✔︎ Opslaan"));
    await waitFor(() =>
      expect(categoryService.updateCategory).toHaveBeenCalledWith("cat1", {
        name: "Groceries",
        budget: 120,
      })
    );
  });

  it("can delete a category", () => {
    render(<CategorySidebar transactions={[]} />);
    fireEvent.click(screen.getAllByText("🗑️")[0]);
    expect(categoryService.deleteCategory).toHaveBeenCalledWith("cat1");
  });
});