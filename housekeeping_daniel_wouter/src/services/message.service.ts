import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";

type Invitation = {
  id: string;
  bookId: string;
  bookName: string;
  ownerId: string;
  };

export function listenToShareInvitations(
  email: string,
  listener: (invitations: Invitation[]) => void
): Unsubscribe {
  return onSnapshot(
    query(
      collection(db, "shareInvitations"),
      where("email", "==", email),
      where("status", "==", "pending")
    ),
    (snapshot) => {
      const invitations: Invitation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        invitations.push({
          id: docSnap.id,
          bookId: data.bookId || "",
          bookName: data.bookName || "",
          ownerId: data.ownerId || "",
        });
      });
      listener(invitations);
    }
  );
}
