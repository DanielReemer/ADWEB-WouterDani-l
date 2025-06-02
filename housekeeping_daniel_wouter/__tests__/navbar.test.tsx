import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import "@testing-library/jest-dom";

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock("@/lib/firebase", () => ({
  auth: {
    signOut: jest.fn(),
  },
}));

describe("Navbar", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading component if loading is true", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: true });

    render(<Navbar />);

    expect(screen.getByText(/even geduld/i)).toBeInTheDocument();
    expect(screen.getByText(/de inhoud wordt geladen/i)).toBeInTheDocument();
  });

  it("shows links for non-logged in user", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });

    render(<Navbar />);

    expect(screen.getByText("Inloggen")).toBeInTheDocument();
    expect(screen.getByText("Registreren")).toBeInTheDocument();
  });

  it("shows welcome message and logout button when user is logged in", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: "test@user.com" },
      loading: false,
    });

    render(<Navbar />);

    expect(screen.getByText(/welkom, test@user.com/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Uitloggen/i })
    ).toBeInTheDocument();
  });

  it("opens and closes mobile menu", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });

    render(<Navbar />);

    const toggleButton = screen.getByRole("button", { name: /Menu/i });

    fireEvent.click(toggleButton);

    expect(screen.getAllByText("Inloggen").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Registreren").length).toBeGreaterThan(1);
  });

  it("calls handleLogout and logs out on click of logout button (desktop)", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: "test@user.com" },
      loading: false,
    });
    (auth.signOut as jest.Mock).mockResolvedValue(undefined);

    render(<Navbar />);

    const logoutButton = screen.getByRole("button", { name: /uitloggen/i });
    fireEvent.click(logoutButton);

    expect(auth.signOut).toHaveBeenCalled();
  });

  it("shows mobile menu for logged in user and can log out", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: "test@user.com" },
      loading: false,
    });
    (auth.signOut as jest.Mock).mockResolvedValue(undefined);

    render(<Navbar />);

    const menuButton = screen.getByRole("button", { name: /menu/i });
    fireEvent.click(menuButton);

    const welcomeMessages = screen.getAllByText(/welkom, test@user.com/i);
    expect(welcomeMessages.length).toBeGreaterThan(0);

    const logoutButtons = screen.getAllByRole("button", { name: /uitloggen/i });
    expect(logoutButtons.length).toBeGreaterThan(0);

    fireEvent.click(logoutButtons[logoutButtons.length - 1]);
    expect(auth.signOut).toHaveBeenCalled();
  });

  it("shows mobile menu for non-logged in user", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(<Navbar />);

    const menuButton = screen.getByRole("button", { name: /menu/i });
    fireEvent.click(menuButton);

    const loginLinks = screen.getAllByText(/inloggen/i);
    expect(loginLinks.length).toBeGreaterThan(0);
    const registerLinks = screen.getAllByText(/registreren/i);
    expect(registerLinks.length).toBeGreaterThan(0);
  });

  it("logs error on logout and shows console.error", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: "test@user.com" },
      loading: false,
    });
  
    const error = new Error("Fout bij uitloggen");
    (auth.signOut as jest.Mock).mockRejectedValue(error);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  
    render(<Navbar />);
  
    const logoutButton = screen.getByRole("button", { name: /uitloggen/i });
    fireEvent.click(logoutButton);
  
    await waitFor(() => {
      expect(auth.signOut).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  
    expect(consoleErrorSpy.mock.calls.some(call =>
      call[0] === "Uitloggen mislukt:" && call[1] instanceof Error && call[1].message === "Fout bij uitloggen"
    )).toBe(true);
  
    consoleErrorSpy.mockRestore();
  });
});
