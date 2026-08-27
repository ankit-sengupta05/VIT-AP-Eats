import {
  doc, getDoc, setDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: "customer" | "partner" | "admin";
  avatarUrl?: string;
  createdAt?: any;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as UserProfile;
}

export async function upsertUserProfile(profile: Omit<UserProfile, "createdAt">): Promise<void> {
  await setDoc(
    doc(db, "users", profile.uid),
    { ...profile, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
