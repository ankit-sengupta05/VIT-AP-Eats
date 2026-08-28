"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, CheckCircle2, XCircle, Clock, Store, Phone, MapPin, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { getPendingApplications, updateApplicationStatus, type PartnerApplication } from "@/lib/db/partners";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  declined: "bg-red-50 text-red-700 border-red-200",
};

export function ApplicationsTab() {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState<"all" | "pending" | "approved" | "declined">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [noteFor, setNoteFor]           = useState<string | null>(null);
  const [note, setNote]                 = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPendingApplications();
      setApplications(data);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, []);

  const handleApprove = async (app: PartnerApplication) => {
    setProcessingId(app.id);
    try {
      // 1. Update application status
      await updateApplicationStatus(app.id, "approved", note || undefined);

      // 2. Create a restaurant document so it appears on the site
      await addDoc(collection(db, "restaurants"), {
        name: app.restaurantName,
        slug: app.restaurantName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        cuisine: app.cuisine,
        rating: 0,
        reviewCount: 0,
        deliveryTime: 30,
        deliveryFee: 15,
        imageUrl: "",
        isOpen: true,
        isVeg: false,
        partnerId: app.uid,
        phone: app.phone,
        address: app.address,
        createdAt: serverTimestamp(),
      });

      toast.success(`✅ "${app.restaurantName}" approved and added to the platform!`);
      setApplications((prev) =>
        prev.map((a) => a.id === app.id ? { ...a, status: "approved" } : a)
      );
    } catch (err: any) {
      toast.error(err.message ?? "Failed to approve");
    } finally {
      setProcessingId(null);
      setNoteFor(null);
      setNote("");
    }
  };

  const handleDecline = async (appId: string, restaurantName: string) => {
    setProcessingId(appId);
    try {
      await updateApplicationStatus(appId, "declined", note || undefined);
      toast.success(`Declined application for "${restaurantName}"`);
      setApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status: "declined" } : a)
      );
    } catch (err: any) {
      toast.error(err.message ?? "Failed to decline");
    } finally {
      setProcessingId(null);
      setNoteFor(null);
      setNote("");
    }
  };

  const filtered = applications.filter((a) => filter === "all" || a.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-bold text-[--color-on-surface] text-lg" style={{ fontFamily: "var(--font-heading)" }}>
          Partner Applications
        </h2>
        <div className="flex items-center gap-2">
          {(["pending", "approved", "declined", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-[--radius-full] text-xs font-semibold border transition-colors capitalize",
                filter === s
                  ? "text-white border-[--color-primary]"
                  : "border-[--color-border] text-[--color-on-surface-variant] bg-[--color-surface-container-lowest]"
              )}
              style={filter === s ? { background: "var(--color-primary)" } : {}}
            >
              {s}
            </button>
          ))}
          <button onClick={fetchApplications} className="px-3 py-1.5 rounded-[--radius-full] text-xs font-semibold border border-[--color-border] text-[--color-on-surface-variant] hover:bg-[--color-surface-container-low] transition-colors">
            Refresh
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={32} className="animate-spin text-[--color-on-surface-variant]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-[--radius-lg] border border-dashed border-[--color-border]"
          style={{ background: "var(--color-surface-container-lowest)" }}>
          <Store size={48} className="mx-auto mb-3 text-[--color-on-surface-variant] opacity-40" />
          <p className="font-semibold text-[--color-on-surface-variant]">
            No {filter === "all" ? "" : filter} applications
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="rounded-[--radius-lg] border border-[--color-border] p-5"
              style={{ backgroundColor: "var(--color-surface-container-lowest)" }}
            >
              {/* App header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[--radius-md] flex items-center justify-center text-white font-bold"
                    style={{ background: "var(--color-primary)" }}>
                    {app.restaurantName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[--color-on-surface]">{app.restaurantName}</p>
                    <p className="text-xs text-[--color-on-surface-variant]">{app.cuisine} · by {app.applicantName}</p>
                  </div>
                </div>
                <span className={cn("px-2 py-0.5 rounded-[--radius-full] text-xs font-semibold border capitalize", STATUS_STYLES[app.status] ?? "")}>
                  {app.status === "pending" && <Clock size={10} className="inline mr-1" />}
                  {app.status === "approved" && <CheckCircle2 size={10} className="inline mr-1" />}
                  {app.status === "declined" && <XCircle size={10} className="inline mr-1" />}
                  {app.status}
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-sm text-[--color-on-surface-variant]">
                <span className="flex items-center gap-1.5"><Phone size={13} /> {app.phone}</span>
                <span className="flex items-center gap-1.5"><MapPin size={13} /> {app.address}</span>
              </div>
              {app.description && (
                <p className="text-sm text-[--color-on-surface-variant] mb-3 bg-[--color-surface-container-low] rounded-[--radius-md] px-3 py-2">
                  {app.description}
                </p>
              )}

              {/* Action buttons (only for pending) */}
              {app.status === "pending" && (
                <div className="space-y-2">
                  {noteFor === app.id && (
                    <div className="flex gap-2">
                      <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional note to applicant..."
                        className="flex-1 px-3 py-1.5 text-sm rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-container-low] text-[--color-on-surface] focus:outline-none focus:ring-1 focus:ring-[--color-primary]"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(app)}
                      disabled={!!processingId}
                      className="flex-1 py-2 rounded-[--radius-md] text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
                      style={{ background: "var(--color-success)" }}>
                      {processingId === app.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Approve & Add Restaurant
                    </button>
                    <button
                      onClick={() => noteFor === app.id ? handleDecline(app.id, app.restaurantName) : setNoteFor(app.id)}
                      disabled={!!processingId}
                      className="flex-1 py-2 rounded-[--radius-md] text-sm font-bold border flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-red-50 transition-colors text-red-600 border-red-200">
                      {processingId === app.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      {noteFor === app.id ? "Confirm Decline" : "Decline"}
                    </button>
                  </div>
                </div>
              )}
              {app.reviewNote && (
                <p className="text-xs text-[--color-on-surface-variant] italic mt-2">Note: &ldquo;{app.reviewNote}&rdquo;</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
