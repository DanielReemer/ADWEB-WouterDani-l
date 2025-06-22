import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/navbar";
import AuthGuard from "@/components/authguard";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AuthGuard>
            <Navbar />
            <main>{children}</main>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
