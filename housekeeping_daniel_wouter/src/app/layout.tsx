import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Huishoudboekje",
  description: "Overzicht van je inkomsten en uitgaven",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="bg-gray-50 text-gray-800 min-h-screen">
        <div className="max-w-2xl mx-auto p-6">
          {children}
        </div>
      </body>
    </html>
  );
}
