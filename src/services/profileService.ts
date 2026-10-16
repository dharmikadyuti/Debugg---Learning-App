import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

export async function submitChallengeUpload(upload: any) {
  return await addDoc(collection(db, "submissions"), {
    ...upload,
    lines: upload.code.split("\n"),
    description: upload.hint,
    xp:
      upload.difficulty === "easy"
        ? 50
        : upload.difficulty === "medium"
          ? 80
          : 120,
    createdAt: serverTimestamp(),
  });
}