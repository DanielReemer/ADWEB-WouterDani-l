import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupPage from "@/app/register/page";
import {
  useCreateUserWithEmailAndPassword,
  useAuthState,
} from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

jest.mock("react-firebase-hooks/auth");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({
  auth: {
    createUserWithEmailAndPassword: jest.fn(),
  },
}));

describe("SignupPage", () => {
  const mockPush = jest.fn();
  const mockCreateUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useCreateUserWithEmailAndPassword as jest.Mock).mockReturnValue([
      mockCreateUser,
      false,
      null,
      null,
    ]);
    (useAuthState as jest.Mock).mockReturnValue([null, false, null]);
  });

  it("renders the signup form correctly", () => {
    (useAuthState as jest.Mock).mockReturnValue([null, false]);

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
    (useAuthState as jest.Mock).mockReturnValue([null, false]);

    render(<SignupPage />);
    fireEvent.submit(screen.getByRole("button", { name: /account aanmaken/i }));
    expect(await screen.findByText(/vul alle velden in/i)).toBeInTheDocument();
  });

  it("shows error if passwords do not match", async () => {
    (useAuthState as jest.Mock).mockReturnValue([null, false]);
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

  it("calls createUserWithEmailAndPassword and redirects on successful signup", async () => {
    (useAuthState as jest.Mock).mockReturnValue([null, false]);

    mockCreateUser.mockResolvedValue({ user: { uid: "abc123" } });
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
      expect(mockCreateUser).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows error if createUserWithEmailAndPassword returns no user", async () => {
    (useAuthState as jest.Mock).mockReturnValue([null, false]);
    mockCreateUser.mockResolvedValue(null);
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

  it("shows error if createUserWithEmailAndPassword throws an error", async () => {
    (useAuthState as jest.Mock).mockReturnValue([null, false]);
    mockCreateUser.mockRejectedValue(new Error("Firebase error"));
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
    (useAuthState as jest.Mock).mockReturnValue([null, false]);
    render(<SignupPage />);
    fireEvent.submit(screen.getByRole("button", { name: /account aanmaken/i }));
    expect(await screen.findByText(/vul alle velden in/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: "a" },
    });
    expect(screen.queryByText(/vul alle velden in/i)).not.toBeInTheDocument();
  });

  it("redirects to '/' if user is logged in", () => {
    (useAuthState as jest.Mock).mockReturnValue([
      { uid: "abc123" },
      false,
      null,
    ]);
    render(<SignupPage />);
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
