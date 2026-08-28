import {
  collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy,
  serverTimestamp, limit, type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ApplicationStatus = "pending" | "approved" | "declined";

export interface PartnerApplication {
  id: string;
  uid: string;
  applicantName: string;
  applicantEmail: string;
  restaurantName: string;
  cuisine: string;
  phone: string;
  address: string;
  description: string;
  status: ApplicationStatus;
  createdAt: Timestamp | null;
  reviewedAt?: Timestamp | null;
  reviewNote?: string;
}

/** Submit a new partner application */
export async function applyAsPartner(
  data: Omit<PartnerApplication, "id" | "status" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "partner_applications"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Get current user's own application (if any) */
export async function getMyApplication(uid: string): Promise<PartnerApplication | null> {
  const q = query(
    collection(db, "partner_applications"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as PartnerApplication;
}

/** Admin: get all pending applications */
export async function getPendingApplications(): Promise<PartnerApplication[]> {
  const q = query(
    collection(db, "partner_applications"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PartnerApplication));
}

/** Admin: update application status */
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  reviewNote?: string
): Promise<void> {
  await updateDoc(doc(db, "partner_applications", applicationId), {
    status,
    reviewNote: reviewNote ?? "",
    reviewedAt: serverTimestamp(),
  });
}
