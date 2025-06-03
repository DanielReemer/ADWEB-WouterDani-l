import { DocumentData } from "firebase/firestore";

export interface Book extends DocumentData {
    id: string;
    name: string;
    balance?: number;
    description?: string;
}