import { Timestamp } from "firebase/firestore";
export default interface Transaction {
  id: string;
  bookId: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: Timestamp;
  archiedAt?: Timestamp;
  categoryId: string | null;
}
