import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase";

export async function getLeaderboardUsers() {
  const snap = await getDocs(
    query(
      collection(db, "users"),
      orderBy("xp", "desc")
    )
  );

  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
  }));
}