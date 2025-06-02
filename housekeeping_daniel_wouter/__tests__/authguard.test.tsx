import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import AuthGuard from "@/components/authGuard";
import { useAuth } from "@/context/AuthContext";
import * as nextNavigation from "next/navigation";

jest.mock("@/context/AuthContext");
jest.mock("next/navigation");
jest.mock("@/components/loading", () => () => <div>Loading...</div>);
jest.mock("@/lib/firebase", () => ({
  auth: {},
}));

const useAuthMock = useAuth as jest.Mock;
const useRouterMock = nextNavigation.useRouter as jest.Mock;
const usePathnameMock = nextNavigation.usePathname as jest.Mock;

describe("AuthGuard routing behavior", () => {
  let replaceMock: jest.Mock;

  beforeEach(() => {
    replaceMock = jest.fn();
    useRouterMock.mockReturnValue({ replace: replaceMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function renderAuthGuard() {
    return render(
      <AuthGuard>
        <div>Test Content</div>
      </AuthGuard>
    );
  }

  test("shows loading while auth loading", () => {
    useAuthMock.mockReturnValue({ user: null, loading: true });
    usePathnameMock.mockReturnValue("/anypath");

    renderAuthGuard();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  test("redirects to /login if unauthenticated on protected route", async () => {
    useAuthMock.mockReturnValue({ user: null, loading: false });
    usePathnameMock.mockReturnValue("/dashboard");

    renderAuthGuard();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login");
    });
  });

  test("redirects to / if authenticated user visits /login", async () => {
    useAuthMock.mockReturnValue({ user: { uid: "user1" }, loading: false });
    usePathnameMock.mockReturnValue("/login");

    renderAuthGuard();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/");
    });
  });

  test("redirects to / if authenticated user visits /register", async () => {
    useAuthMock.mockReturnValue({ user: { uid: "user1" }, loading: false });
    usePathnameMock.mockReturnValue("/register");

    renderAuthGuard();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/");
    });
  });

  test("does not redirect if authenticated user visits protected route", async () => {
    useAuthMock.mockReturnValue({ user: { uid: "user1" }, loading: false });
    usePathnameMock.mockReturnValue("/dashboard");

    renderAuthGuard();

    await waitFor(() => {
      expect(replaceMock).not.toHaveBeenCalled();
    });
  });

  test("does not redirect if unauthenticated user visits /login", async () => {
    useAuthMock.mockReturnValue({ user: null, loading: false });
    usePathnameMock.mockReturnValue("/login");

    renderAuthGuard();

    await waitFor(() => {
      expect(replaceMock).not.toHaveBeenCalled();
    });
  });

  test("does not redirect if unauthenticated user visits /register", async () => {
    useAuthMock.mockReturnValue({ user: null, loading: false });
    usePathnameMock.mockReturnValue("/register");

    renderAuthGuard();

    await waitFor(() => {
      expect(replaceMock).not.toHaveBeenCalled();
    });
  });
});
