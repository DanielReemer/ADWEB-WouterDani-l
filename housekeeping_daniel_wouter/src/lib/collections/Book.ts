import { DocumentData, Timestamp} from "firebase/firestore";

export interface Book extends DocumentData {
  id: string;
  name: string;
  ownerId: string;
  description?: string;
  transactionIds?: string[];
  sharedWith?: string[];
  archivedAt?: Timestamp;
}

export interface BookFormData {
  name: string;
  description?: string;
}
