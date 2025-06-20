import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import * as authService from "@/services/auth.service";
import { useRouter } from "next/navigation";

jest.mock("@/services/auth.service", () => ({
  signIn: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({
  auth: {},
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockSignIn = authService.signIn as jest.Mock;

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders login form correctly", () => {
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
    mockSignIn.mockResolvedValue(null);
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
    mockSignIn.mockResolvedValue({
      user: { uid: "abc123" },
    });
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
