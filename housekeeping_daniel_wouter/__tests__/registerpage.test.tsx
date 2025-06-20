import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupPage from "@/app/register/page";
import * as authService from "@/services/auth.service";
import { useRouter } from "next/navigation";

jest.mock("@/services/auth.service", () => ({
  signUp: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({
  auth: {},
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("SignupPage", () => {
  const mockPush = jest.fn();
  const mockSignUp = authService.signUp as jest.Mock;

  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders the signup form correctly", () => {
    render(<SignupPage />);
    expect(screen.getByLabelText(/e-mailadres/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^wachtwoord$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bevestig wachtwoord/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /account aanmaken/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/heb je al een account/i)).toBeInTheDocument();
  });

  it("shows error if fields are empty on submit", async () => {
    render(<SignupPage />);
    fireEvent.submit(screen.getByRole("button", { name: /account aanmaken/i }));
    expect(await screen.findByText(/vul alle velden in/i)).toBeInTheDocument();
  });

  it("shows error if passwords do not match", async () => {
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^wachtwoord$/i), {
      target: { value: "password1" },
    });
    fireEvent.change(screen.getByLabelText(/bevestig wachtwoord/i), {
      target: { value: "password2" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /account aanmaken/i }));
    expect(
      await screen.findByText(/wachtwoorden komen niet overeen/i)
    ).toBeInTheDocument();
  });

  it("calls signUp and redirects on successful signup", async () => {
    mockSignUp.mockResolvedValue({ user: { uid: "abc123" } });
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^wachtwoord$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/bevestig wachtwoord/i), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /account aanmaken/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows error if signUp returns no user", async () => {
    mockSignUp.mockResolvedValue(null);
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^wachtwoord$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/bevestig wachtwoord/i), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /account aanmaken/i }));

    expect(
      await screen.findByText(
        /account aanmaken mislukt\. probeer het opnieuw\./i
      )
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows error if signUp throws an error", async () => {
    mockSignUp.mockRejectedValue(new Error("Firebase error"));
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^wachtwoord$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/bevestig wachtwoord/i), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /account aanmaken/i }));

    expect(
      await screen.findByText(
        /er is een fout opgetreden bij het aanmaken van het account\. probeer het opnieuw\./i
      )
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clears error and success messages when typing", async () => {
    render(<SignupPage />);
    fireEvent.submit(screen.getByRole("button", { name: /account aanmaken/i }));
    expect(await screen.findByText(/vul alle velden in/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: "a" },
    });
    expect(screen.queryByText(/vul alle velden in/i)).not.toBeInTheDocument();
  });
});
