
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function saveUserProgress(userId: string, updates: any) {
  await updateDoc(doc(db, "users", userId), updates);
}
