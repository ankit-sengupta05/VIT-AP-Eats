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
        let resolvedRole: "customer" | "partner" | "admin" = "customer";
        let phone = "";
        let fullName = "";

        try {
          // 1. First, check secure custom claims (set by the set-admin-role script)
          const tokenResult = await firebaseUser.getIdTokenResult();
          if (tokenResult.claims.role) {
            resolvedRole = tokenResult.claims.role as "customer" | "partner" | "admin";
          }
          
          // 2. Fetch additional profile data from Firestore
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            phone = data?.phone ?? "";
            fullName = data?.fullName ?? "";
            // Fallback to Firestore role if claims aren't set
            if (!tokenResult.claims.role && data?.role) {
              resolvedRole = (data?.role as "customer" | "partner" | "admin");
            }
          }
        } catch (err) {
          console.error("Failed to fetch user role/profile:", err);
          // Fallback to customer if Firestore fails
        }

        // Write role + uid to cookies so the middleware can read them
        setCookie("app_uid",  firebaseUser.uid);
        setCookie("app_role", resolvedRole);

        const appUser: AppUser = {
          uid:         firebaseUser.uid,
          email:       firebaseUser.email,
          displayName: firebaseUser.displayName ?? fullName ?? null,
          role:        resolvedRole,
          phone,
          fullName,
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
