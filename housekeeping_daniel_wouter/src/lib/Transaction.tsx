import { Timestamp } from "firebase/firestore";
export default interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: Timestamp;
}