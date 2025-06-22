import { Timestamp } from "firebase/firestore";
export default interface Transaction {
  id: string;
  userId: string;
  bookId: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: Timestamp;
  categoryId: string | null;
}