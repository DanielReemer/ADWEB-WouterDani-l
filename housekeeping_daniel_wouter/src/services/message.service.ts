import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";

export function listenToShareInvitations(
  email: string,
  listener: (invitations: unknown[]) => void
): Unsubscribe {
  return onSnapshot(
    query(
      collection(db, "shareInvitations"),
      where("email", "==", email),
      where("status", "==", "pending")
    ),
    (snapshot) => {
      const invitations: unknown[] = [];
      snapshot.forEach((docSnap) => {
        invitations.push({ id: docSnap.id, ...docSnap.data() });
      });
      listener(invitations);
    }
  );
}
