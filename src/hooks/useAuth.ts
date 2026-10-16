
import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  getRedirectResult,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import type { AppUser } from "../types/user";

export function useAuth(
  setUser: Dispatch<SetStateAction<AppUser | null>>,
  setPage: (page: string) => void
) {
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      if (err) {
        console.error(
          "Google redirect result error:",
          err.code,
          err.message
        );
      }
    });

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(
            doc(db, "users", firebaseUser.uid)
          );

         if (userDoc.exists()) {
  setUser({
    ...userDoc.data(),
    uid: firebaseUser.uid,
  } as AppUser);
} else {
            const fallbackData: AppUser = {
              name:
                firebaseUser.displayName ||
                firebaseUser.email!.split("@")[0],
              email: firebaseUser.email,
              uid: firebaseUser.uid,
              avatar: "🚀",
              role: "user",
              xp: 0,
              streak: 0,
              solved: 0,
              lastSolvedDate: null,
              solvedChallenges: [],
              createdAt: serverTimestamp(),
            };

            await setDoc(
              doc(db, "users", firebaseUser.uid),
              fallbackData
            );

            setUser(fallbackData);
          }

          setPage("dashboard");
        } catch (e) {
          console.error("Error loading user data:", e);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsub();
  }, [setUser, setPage]);
}
