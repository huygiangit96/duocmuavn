"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { useUserStore } from "@/lib/store";

export function useAuth() {
  const { user, token, setUser } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null, null);
        return;
      }

      const idToken = await firebaseUser.getIdToken();
      setUser(firebaseUser, idToken);
    });

    return unsubscribe;
  }, [setUser]);

  return { user, token };
}
