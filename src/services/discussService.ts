import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase";

export async function getFirestorePosts() {
  const snap = await getDocs(
    query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    )
  );

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}