"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/app/loading";
import { signOut } from "@/services/auth.service";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const toggleMenu = () => setMenuOpen((open) => !open);

  const handleLogout = async () => {
    setError(null);
    try {
      await signOut();
    } catch {
      setError("Uitloggen mislukt. Probeer het opnieuw of ververs de pagina.");
    }
  };

  if (loading) return <Loading />;

  return (
    <header className="bg-white shadow-md sticky top-0 left-0 w-full z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-800">
          HuishoudBalans
        </Link>

        <div className="hidden md:flex gap-6 items-center">
          <Link
            href="/"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Home
          </Link>
          <Link
            href="/books"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Boeken
          </Link>
          {!loading &&
            (user ? (
              <>
                <span className="text-gray-700 text-sm">
                  Welkom, {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white bg-red-500 hover:bg-red-600 px-4 py-1 rounded transition hover:shadow-md hover:cursor-pointer"
                  aria-label="Uitloggen"
                >
                  Uitloggen
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-blue-600 hover:underline">
                  Inloggen
                </Link>
                <Link
                  href="/register"
                  className="text-blue-600 hover:underline"
                >
                  Registreren
                </Link>
              </>
            ))}
        </div>

        <button
          className="md:hidden text-gray-700 hover:text-blue-600"
          onClick={toggleMenu}
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </nav>

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2"
            role="alert"
          >
            {error}
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="md:hidden bg-white shadow-md px-4 pt-2 pb-4 space-y-2">
          <Link href="/" className="block text-gray-700 hover:text-blue-600">
            Home
          </Link>
          <Link
            href="/books"
            className="block text-gray-700 hover:text-blue-600"
          >
            Boeken
          </Link>
          {!loading &&
            (user ? (
              <>
                <p className="text-gray-700">Welkom, {user.email}</p>
                <button
                  onClick={handleLogout}
                  className="w-full text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                  aria-label="Uitloggen"
                >
                  Uitloggen
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-blue-600 hover:underline"
                >
                  Inloggen
                </Link>
                <Link
                  href="/register"
                  className="block text-blue-600 hover:underline"
                >
                  Registreren
                </Link>
              </>
            ))}
        </div>
      )}
    </header>
  );
}
