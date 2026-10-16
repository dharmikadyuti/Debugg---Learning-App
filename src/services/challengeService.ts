import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase";

export async function getFirestoreChallenges() {
  const snap = await getDocs(
    query(
      collection(db, "challenges"),
      orderBy("createdAt", "desc")
    )
  );

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    lines: d.data().lines || [],
  }));
}