"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut as fbSignOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "customer" | "partner" | "admin";
  phone: string;
  fullName: string;
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function useSession() {
  const [user, setUser]       = useState<AppUser | null>(null);
  const [role, setRole]       = useState<string>("customer");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        const data = snap.data();
        const resolvedRole = (data?.role as "customer" | "partner" | "admin") ?? "customer";

        // Write role + uid to cookies so the middleware can read them
        setCookie("app_uid",  firebaseUser.uid);
        setCookie("app_role", resolvedRole);

        const appUser: AppUser = {
          uid:         firebaseUser.uid,
          email:       firebaseUser.email,
          displayName: firebaseUser.displayName,
          role:        resolvedRole,
          phone:       data?.phone ?? "",
          fullName:    data?.fullName ?? "",
        };
        setUser(appUser);
        setRole(resolvedRole);
      } else {
        deleteCookie("app_uid");
        deleteCookie("app_role");
        setUser(null);
        setRole("customer");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signOut = async () => {
    await fbSignOut(auth);
    deleteCookie("app_uid");
    deleteCookie("app_role");
    router.push("/login");
    router.refresh();
  };

  return { user, role, loading, signOut };
}
