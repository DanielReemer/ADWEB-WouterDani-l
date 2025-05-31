import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupPage from "@/app/register/page";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

jest.mock("react-firebase-hooks/auth");
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

describe("SignupPage", () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

        (useCreateUserWithEmailAndPassword as jest.Mock).mockReturnValue([
            jest.fn(),
            false,
            null,
            null,
        ]);
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

    it("calls createUserWithEmailAndPassword and redirects on successful signup", async () => {
        const mockCreateUser = jest
            .fn()
            .mockResolvedValue({ user: { uid: "abc123" } });
        (useCreateUserWithEmailAndPassword as jest.Mock).mockReturnValue([
            mockCreateUser,
            false,
            null,
            null,
        ]);

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

    it("clears error and success messages when typing", () => {
        render(<SignupPage />);

        fireEvent.submit(screen.getByRole("button", { name: /account aanmaken/i }));
        expect(screen.getByText(/vul alle velden in/i)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
            target: { value: "a" },
        });

        expect(screen.queryByText(/vul alle velden in/i)).not.toBeInTheDocument();
    });
});
