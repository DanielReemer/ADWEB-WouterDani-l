import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditBookPage from "@/app/books/[slug]/edit/page";
import { useRouter, useParams } from "next/navigation";
import { listenToBook, updateBook } from "@/services/book.service";
import { archiveBook } from "@/services/bookArchive.service";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("@/services/book.service", () => ({
  listenToBook: jest.fn(),
  updateBook: jest.fn(),
}));

jest.mock("@/services/bookArchive.service", () => ({
  archiveBook: jest.fn(),
}));

jest.mock("@/lib/hooks/useRequireUser", () => ({
  useRequireUser: jest.fn(),
}));

jest.mock("@/app/loading", () => () => <div>Loading...</div>);

jest.mock("@/app/books/BookForm", () => ({
  __esModule: true,
  default: ({ initialData, onSubmit }: any) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(initialData);
      }}
    >
      <input name="name" defaultValue={initialData.name} />
      <textarea name="description" defaultValue={initialData.description} />
      <button type="submit">Opslaan</button>
    </form>
  ),
}));

describe("EditBookPage", () => {
  const mockRouterPush = jest.fn();
  const mockSlug = "book1";
  const mockUser = { uid: "testUserId" };
  const mockBook = {
    id: mockSlug,
    name: "Test Book",
    description: "Test Description",
    ownerId: mockUser.uid,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (useParams as jest.Mock).mockReturnValue({ slug: mockSlug });
    (useRequireUser as jest.Mock).mockReturnValue(mockUser);
    (listenToBook as jest.Mock).mockImplementation((_id, callback) => {
      callback(mockBook);
      return jest.fn();
    });
    (updateBook as jest.Mock).mockResolvedValue(undefined);
    (archiveBook as jest.Mock).mockResolvedValue(undefined);
  });

  it("renders loading state initially", () => {
    (listenToBook as jest.Mock).mockImplementation(() => jest.fn());

    render(<EditBookPage />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders global error if book is not found", () => {
    (listenToBook as jest.Mock).mockImplementation((_id, callback) => {
      callback(null);
      return jest.fn();
    });

    render(<EditBookPage />);

    expect(screen.getByText("Boek niet gevonden.")).toBeInTheDocument();
  });

  it("renders the book form with initial data", () => {
    render(<EditBookPage />);

    expect(screen.getByDisplayValue("Test Book")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
  });

  it("submits the form and updates the book", async () => {
    render(<EditBookPage />);

    fireEvent.submit(screen.getByText("Opslaan"));

    await waitFor(() => {
      expect(updateBook).toHaveBeenCalledWith(mockSlug, {
        name: "Test Book",
        description: "Test Description",
      });
      expect(mockRouterPush).toHaveBeenCalledWith(`/books/${mockSlug}`);
    });
  });

  it("archives the book when the archive button is clicked", async () => {
    render(<EditBookPage />);

    fireEvent.click(screen.getByText("Archiveren"));

    await waitFor(() => {
      expect(archiveBook).toHaveBeenCalledWith(mockSlug);
      expect(mockRouterPush).toHaveBeenCalledWith("/books");
    });
  });
});
