import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 text-gray-800 p-8">
      <main className="flex flex-col items-center text-center mt-16">
        <h1 className="text-4xl font-bold mb-4 text-white">Welkom bij huishoudBalans</h1>
        <p className="text-lg text-gray-200 mb-8">
          Beheer je boeken, berichten en meer met gemak.
        </p>
        <div className="flex gap-4">
          <Link
            href="/books"
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Boeken
          </Link>
          <Link
            href="/messages"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Berichten
          </Link>
        </div>
      </main>
    </div>
  );
}