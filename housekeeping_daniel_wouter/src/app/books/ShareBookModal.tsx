import { useRef, useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (emails: string[]) => void;
  loading: boolean;
  error?: string | null;
  success?: string | null;
  bookName?: string | null;
};

export default function ShareBookModal({
  open,
  onClose,
  onSubmit,
  loading,
  error,
  success,
  bookName,
}: Props) {
  const [emails, setEmails] = useState<string[]>([""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (open) {
      setEmails([""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 10);
    }
  }, [open]);

  const handleEmailChange = (index: number, value: string) => {
    setEmails((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddField = () => {
    setEmails((prev) => [...prev, ""]);
    setTimeout(() => inputRefs.current[emails.length]?.focus(), 10);
  };

  const handleRemoveField = (index: number) => {
    setEmails((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
    setTimeout(() => inputRefs.current[Math.max(0, index - 1)]?.focus(), 10);
  };

  const canSubmit =
    emails.some((e) => e.trim()) &&
    emails.every((e) => e.trim() !== "") &&
    !loading &&
    !success;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Sluiten"
          disabled={loading}
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-2 text-blue-700">
          Deel boek{bookName ? `: ${bookName}` : ""}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) {
              onSubmit(emails.map((e) => e.trim()).filter(Boolean));
            }
          }}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-700">Nodig uit per e-mail</span>
            <div className="flex flex-col gap-2">
              {emails.map((email, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="email"
                    placeholder="E-mailadres"
                    className="border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
                    value={email}
                    onChange={(e) => handleEmailChange(idx, e.target.value)}
                    disabled={loading || !!success}
                    autoFocus={idx === 0}
                  />
                  {emails.length > 1 && (
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-600 text-lg px-1"
                      onClick={() => handleRemoveField(idx)}
                      disabled={loading || !!success}
                      aria-label="Verwijder veld"
                    >
                      −
                    </button>
                  )}
                  {idx === emails.length - 1 && (
                    <button
                      type="button"
                      className="text-gray-400 hover:text-green-600 text-lg px-1"
                      onClick={handleAddField}
                      disabled={loading || !!success}
                      aria-label="Voeg veld toe"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>
          </label>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            disabled={!canSubmit}
          >
            {loading ? "Versturen..." : "Uitnodigen"}
          </button>
        </form>
        <div className="text-xs text-gray-400 mt-4">
          Gedeelde gebruikers ontvangen een uitnodiging per e-mail.
        </div>
      </div>
    </div>
  );
}
