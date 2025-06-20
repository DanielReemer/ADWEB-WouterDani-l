import { signIn, signUp, signOut } from "@/services/auth.service";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

jest.mock("@/lib/firebase", () => ({
  auth: {
    signOut: jest.fn(),
  },
}));

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));

const mockUserCredential = { user: { uid: "test" } };

describe("auth.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("signIn", () => {
    it("calls signInWithEmailAndPassword with correct args and returns result", async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(
        mockUserCredential
      );
      const result = await signIn("email", "pass");
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        "email",
        "pass"
      );
      expect(result).toBe(mockUserCredential);
    });

    it("throws if signInWithEmailAndPassword rejects", async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
        new Error("fail")
      );
      await expect(signIn("fail", "bad")).rejects.toThrow("fail");
    });
  });

  describe("signUp", () => {
    it("calls createUserWithEmailAndPassword with correct args and returns result", async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(
        mockUserCredential
      );
      const result = await signUp("foo", "bar");
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        "foo",
        "bar"
      );
      expect(result).toBe(mockUserCredential);
    });

    it("throws if createUserWithEmailAndPassword rejects", async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(
        new Error("signup fail")
      );
      await expect(signUp("fail", "bad")).rejects.toThrow("signup fail");
    });
  });

  describe("signOut", () => {
    it("calls auth.signOut and resolves", async () => {
      (auth.signOut as jest.Mock).mockResolvedValue(undefined);
      await expect(signOut()).resolves.toBeUndefined();
      expect(auth.signOut).toHaveBeenCalled();
    });

    it("throws if auth.signOut rejects", async () => {
      (auth.signOut as jest.Mock).mockRejectedValue(new Error("signout fail"));
      await expect(signOut()).rejects.toThrow("signout fail");
    });
  });
});
