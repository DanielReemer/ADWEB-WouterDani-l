"use client";

import React from "react";

export default function BookDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex align-center justify-center bg-gradient-to-br p-10 from-white via-gray-100 to-blue-100 px-4">
      {children}
    </div>
  );
}