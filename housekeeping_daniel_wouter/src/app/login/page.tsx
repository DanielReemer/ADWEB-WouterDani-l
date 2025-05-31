"use client";

import {  useState } from "react";
import {
  useSignInWithEmailAndPassword,
} from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setEmail("");
    setPassword("");
    try {
      const response = await signInWithEmailAndPassword(email, password);

      if (!response || !response.user) {
        setError("Inloggen mislukt: Ongeldige gebruikersgegevens.");
        return;
      }

      router.push("/");
    } catch (error: any) {
      setError(
        "Er is een fout opgetreden bij het inloggen. Probeer het opnieuw."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-2">
          Log in op je account
        </h2>
        <p className="text-center text-gray-500 mb-8">Welkom terug!</p>
        <form onSubmit={handleSignIn} className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mailadres..."
              aria-invalid={!!error}
              aria-describedby="email-error"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Wachtwoord
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wachtwoord..."
              aria-invalid={!!error}
              aria-describedby="password-error"
            />
          </div>
          {error && (
            <div
              id="error-message"
              className="rounded-md bg-red-100 border border-red-400 text-red-700 px-4 py-3"
              role="alert"
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Inloggen
          </button>
        </form>
        <div className="mt-6 flex justify-center">
          <span className="text-sm text-gray-600">
            Nog niet geregistreerd?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:underline hover:text-blue-800 transition"
            >
              Registreer hier
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
