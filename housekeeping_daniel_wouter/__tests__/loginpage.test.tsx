import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import {
  useSignInWithEmailAndPassword,
  useAuthState,
} from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

jest.mock("react-firebase-hooks/auth");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/lib/firebase", () => ({
  auth: {
    signInWithEmailAndPassword: jest.fn(),
  },
}));

const mockPush = jest.fn();

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    (useSignInWithEmailAndPassword as jest.Mock).mockReturnValue([
      jest.fn(),
      false,
      null,
      null,
    ]);
  });

  it("renders login form correctly", () => {
    (useAuthState as jest.Mock).mockReturnValue([null, false]);

    render(<LoginPage />);
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wachtwoord/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /inloggen/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /registreer hier/i })
    ).toBeInTheDocument();
  });

  it("shows error message on failed login", async () => {
    const signInMock = jest.fn().mockResolvedValue(null);
    (useSignInWithEmailAndPassword as jest.Mock).mockReturnValue([
      signInMock,
      false,
      null,
      null,
    ]);
    (useAuthState as jest.Mock).mockReturnValue([null, false]);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/wachtwoord/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /inloggen/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/inloggen mislukt: ongeldige gebruikersgegevens/i)
      ).toBeInTheDocument();
    });
  });

  it("navigates to home on successful login", async () => {
    const signInMock = jest.fn().mockResolvedValue({ user: { uid: "abc123" } });
    (useSignInWithEmailAndPassword as jest.Mock).mockReturnValue([
      signInMock,
      false,
      null,
      null,
    ]);
    (useAuthState as jest.Mock).mockReturnValue([null, false]);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/wachtwoord/i), {
      target: { value: "password" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /inloggen/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
