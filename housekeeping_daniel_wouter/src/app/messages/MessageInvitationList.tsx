"use client";
import { useState } from "react";
import { acceptBookShare } from "@/services/book.service";
import { respondToShareInvitation } from "@/services/bookShare.service";
import { useRequireUser } from "@/lib/hooks/useRequireUser";

type Props = {
  invitations: any[];
};

export default function MessageCenterInvitationList({ invitations }: Props) {
  const user = useRequireUser();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRespond = async (
    invitation: any,
    status: "accepted" | "declined"
  ) => {
    setLoadingId(invitation.id);
    setError(null);
    try {
      await respondToShareInvitation(invitation.id, status, user.uid);
      if (status === "accepted") {
        await acceptBookShare(
          invitation.id,
          user.uid,
          invitation.bookId,
          invitation.ownerId
        );
      }
    } catch (e: any) {
      setError(e.message || "Onbekende fout");
    } finally {
      setLoadingId(null);
    }
  };

  if (!invitations.length) {
    return <div className="text-gray-500">Geen uitnodigingen gevonden.</div>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {invitations.map((invitation) => (
        <li
          key={invitation.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border rounded-lg bg-blue-50"
        >
          <div>
            <div>
              <span className="font-semibold text-blue-800">
                Uitnodiging voor boek:
              </span>{" "}
              {invitation.bookName}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Van gebruiker:{" "}
              <span className="font-mono">{invitation.ownerId}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              className="px-4 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition"
              disabled={loadingId === invitation.id}
              onClick={() => handleRespond(invitation, "accepted")}
            >
              Accepteren
            </button>
            <button
              className="px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
              disabled={loadingId === invitation.id}
              onClick={() => handleRespond(invitation, "declined")}
            >
              Afwijzen
            </button>
          </div>
        </li>
      ))}
      {error && <div className="text-red-600">{error}</div>}
    </ul>
  );
}
