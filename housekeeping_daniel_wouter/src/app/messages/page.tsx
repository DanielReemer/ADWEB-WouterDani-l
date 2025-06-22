"use client";
import { useEffect, useState } from "react";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { listenToShareInvitations } from "@/services/message.service";
import MessageCenterInvitationList from "@/app/messages/MessageInvitationList";

type Invitation = {
  id: string;
  bookId: string;
  bookName: string;
  ownerId: string;
  };

export default function MessageCenterPage() {
  const user = useRequireUser();
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    if (!user.email) return;
    const unsubscribe = listenToShareInvitations(user.email, setInvitations);
    return unsubscribe;
  }, [user.email]);

  return (
    <section className="w-full max-w-3xl mx-auto my-8 p-6 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-blue-600">Berichtencentrum</h2>
      <MessageCenterInvitationList invitations={invitations} />
    </section>
  );
}
