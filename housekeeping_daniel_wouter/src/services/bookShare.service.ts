import { db } from "@/lib/firebase";
import { doc, addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";

export async function inviteToShareBook(
  ownerId: string,
  bookId: string,
  bookName: string,
  emails: string[]
): Promise<void> {
  for (const email of emails) {
    await addDoc(collection(db, "shareInvitations"), {
      email,
      ownerId,
      bookId,
      bookName,
      status: "pending",
      createdAt: serverTimestamp(),
    });
  }
}

export async function respondToShareInvitation(
  invitationId: string,
  status: "accepted" | "declined",
  userId: string
): Promise<void> {
  await updateDoc(doc(db, "shareInvitations", invitationId), {
    status,
    respondedAt: serverTimestamp(),
    userId: status === "accepted" ? userId : null,
  });
}
