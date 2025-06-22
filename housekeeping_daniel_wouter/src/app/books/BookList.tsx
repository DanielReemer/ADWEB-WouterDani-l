import { Book } from "@/lib/collections/Book";

interface BookListProps {
  books: Book[];
  title?: string;
  children?: (book: Book) => React.ReactNode;
}

export default function BookList({ books, title, children }: BookListProps) {
  if (!books || books.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-gray-500">Geen boeken gevonden.</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6 p-6 w-full">
      <h2 className="text-3xl font-bold text-blue-600">
        {title || "Boekenlijst"}
      </h2>
      <div className="flex flex-col gap-4">
        {books.map((book) =>
          children ? (
            <div key={book.id}>{children(book)}</div>
          ) : (
            <div
              key={book.id}
              className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-lg shadow-2xl bg-gradient-to-r from-sky-400 to-blue-50 hover:from-sky-500 hover:to-blue-600 transition"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{book.name}</h3>
              </div>
              {typeof book.balance === "number" && (
                <div className="flex-none text-right">
                  <strong>
                    <span className="text-sm mr-1">Balans:</span>
                  </strong>
                  <span
                    className={`text-xl font-bold ${
                      book.balance < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    €{" "}
                    {book.balance.toLocaleString("nl-NL", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </section>
  );
}
