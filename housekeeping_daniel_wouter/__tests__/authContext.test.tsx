import React from "react";
import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import "@testing-library/jest-dom";

jest.mock("react-firebase-hooks/auth", () => ({
  useAuthState: () => [null, false, undefined],
}));
jest.mock("@/lib/firebase", () => ({
  auth: {},
}));

function TestComponent() {
  const { user, loading, error } = useAuth();
  return (
    <div>
      <div>user: {user ? user.uid : "null"}</div>
      <div>loading: {loading ? "true" : "false"}</div>
      <div>error: {error ? "yes" : "no"}</div>
    </div>
  );
}

describe("AuthContext", () => {
  it("provides auth context values", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText("user: null")).toBeInTheDocument();
    expect(screen.getByText("loading: false")).toBeInTheDocument();
    expect(screen.getByText("error: no")).toBeInTheDocument();
  });
});