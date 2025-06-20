"use client";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (emails: string[]) => void;
  loading: boolean;
  error: string | null;
};

export default function ShareBookModal({
  open,
  onClose,
  onSubmit,
  loading,
  error,
}: Props) {
  const [emails, setEmails] = useState<string>("");
  useEffect(() => {
    if (!open) setEmails("");
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Boek delen</h3>
        <p className="text-sm text-gray-600">
          Vul één of meerdere e-mailadressen in, gescheiden door een komma.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const emailArr = emails
              .split(",")
              .map((e) => e.trim())
              .filter((e) => !!e);
            onSubmit(emailArr);
          }}
          className="flex flex-col gap-2"
        >
          <textarea
            autoFocus
            required
            placeholder="E-mailadressen (gescheiden door komma)"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            className="border rounded px-3 py-2"
            rows={3}
            disabled={loading}
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              disabled={loading}
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Uitnodigen..." : "Uitnodigen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
