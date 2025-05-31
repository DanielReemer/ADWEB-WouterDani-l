"use client";

import React, { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.email || !form.password || !form.confirmPassword) {
      setError("Vul alle velden in.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    try {
      const response = await createUserWithEmailAndPassword(form.email, form.password);
      setForm({ email: "", password: "", confirmPassword: "" });

      router.push("/");
    } catch (errror) {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-white to-blue-100 flex flex-col justify-center items-center">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg bg-white border border-gray-100">
        <h2 className="text-3xl font-bold text-blue-600 mb-2 text-center">
          Aanmelden
        </h2>
        <p className="text-gray-500 mb-8 text-center">
          Maak een account aan met e-mail en wachtwoord
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              E-mailadres
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
              placeholder="E-mailadres..."
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Wachtwoord
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Bevestig wachtwoord
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-center">{success}</div>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-150 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Account aanmaken
          </button>
        </form>
        <p className="mt-6 text-center text-gray-500 text-sm">
          Heb je al een account?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
