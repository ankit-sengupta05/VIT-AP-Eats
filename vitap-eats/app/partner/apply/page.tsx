"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ArrowLeft, CheckCircle2, Clock, XCircle, Loader2, Send } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useSession } from "@/lib/hooks/useSession";
import { applyAsPartner, getMyApplication, type PartnerApplication } from "@/lib/db/partners";

const CUISINE_OPTIONS = [
  "Indian", "Fast Food", "Chinese", "South Indian", "Pizza", "Healthy",
  "Desserts", "Beverages", "Continental", "Street Food", "Other"
];

export default function PartnerApplyPage() {
  const { user, loading } = useSession();
  const router = useRouter();

  const [existing, setExisting] = useState<PartnerApplication | null | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    restaurantName: "",
    cuisine: "Fast Food",
    phone: "",
    address: "",
    description: "",
  });

  // Load existing application on mount
  useEffect(() => {
    if (!user) return;
    getMyApplication(user.uid).then(setExisting).catch(() => setExisting(null));
  }, [user]);

  const handleChange = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    if (!form.restaurantName || !form.phone || !form.address) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await applyAsPartner({
        uid: user.uid,
        applicantName: user.displayName ?? "Applicant",
        applicantEmail: user.email ?? "",
        restaurantName: form.restaurantName,
        cuisine: form.cuisine,
        phone: form.phone,
        address: form.address,
        description: form.description,
      });
      toast.success("Application submitted! We'll review it shortly.");
      // Re-fetch to show pending state
      const app = await getMyApplication(user.uid);
      setExisting(app);
    } catch (err: any) {
      toast.error(err.message ?? "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || existing === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <Loader2 size={36} className="animate-spin text-[--color-primary]" />
      </div>
    );
  }

  // Already has an approved application
  if (existing?.status === "approved") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "var(--color-bg)" }}>
        <CheckCircle2 size={64} className="text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-[--color-on-surface] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Application Approved! 🎉
        </h1>
        <p className="text-[--color-on-surface-variant] mb-6">Your restaurant partner account is active.</p>
        <Link href="/partner"
          className="px-6 py-3 rounded-[--radius-full] text-white font-bold text-sm"
          style={{ background: "var(--color-primary)" }}>
          Go to Partner Dashboard
        </Link>
      </div>
    );
  }

  // Pending
  if (existing?.status === "pending") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "var(--color-bg)" }}>
        <Clock size={64} className="text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold text-[--color-on-surface] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Application Under Review
        </h1>
        <p className="text-[--color-on-surface-variant] mb-2">
          Your application for <strong className="text-[--color-on-surface]">{existing.restaurantName}</strong> has been received.
        </p>
        <p className="text-sm text-[--color-on-surface-variant]">We&apos;ll notify you once it&apos;s reviewed.</p>
        <Link href="/" className="mt-6 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  // Declined
  if (existing?.status === "declined") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "var(--color-bg)" }}>
        <XCircle size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-[--color-on-surface] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Application Declined
        </h1>
        <p className="text-[--color-on-surface-variant] mb-2">
          Unfortunately, your application for <strong className="text-[--color-on-surface]">{existing.restaurantName}</strong> was not approved.
        </p>
        {existing.reviewNote && (
          <p className="text-sm text-[--color-on-surface-variant] italic mb-4">
            &ldquo;{existing.reviewNote}&rdquo;
          </p>
        )}
        <Link href="/" className="mt-4 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  // No existing application — show form
  return (
    <div className="min-h-screen py-10 px-4" style={{ background: "var(--color-bg)" }}>
      <Toaster position="top-right" />
      <div className="max-w-xl mx-auto">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-6 text-[--color-on-surface-variant] hover:text-[--color-primary] transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4"
            style={{ background: "var(--color-primary)" }}>
            <Store size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
            Partner with us
          </h1>
          <p className="text-[--color-on-surface-variant] mt-2">
            Reach thousands of students on campus. Fill in the details below and we&apos;ll get back to you.
          </p>
        </div>

        {!user ? (
          <div className="rounded-[--radius-lg] p-8 text-center border border-[--color-border]"
            style={{ background: "var(--color-surface-container-lowest)" }}>
            <p className="text-[--color-on-surface] font-semibold mb-4">Please sign in to apply.</p>
            <Link href="/login"
              className="inline-block px-6 py-2 rounded-[--radius-full] text-white font-bold text-sm"
              style={{ background: "var(--color-primary)" }}>
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}
            className="rounded-[--radius-lg] p-6 md:p-8 border border-[--color-border] space-y-5"
            style={{ backgroundColor: "var(--color-surface-container-lowest)" }}>

            {/* Restaurant Name */}
            <div>
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">
                Restaurant / Food Stall Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.restaurantName}
                onChange={(e) => handleChange("restaurantName", e.target.value)}
                placeholder="e.g. VIT Bites"
                required
                className="w-full px-4 py-2.5 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-container-low] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
              />
            </div>

            {/* Cuisine */}
            <div>
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">
                Primary Cuisine <span className="text-red-500">*</span>
              </label>
              <select
                value={form.cuisine}
                onChange={(e) => handleChange("cuisine", e.target.value)}
                className="w-full px-4 py-2.5 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-container-low] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
              >
                {CUISINE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="e.g. 9034537165"
                type="tel"
                required
                className="w-full px-4 py-2.5 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-container-low] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">
                Location / Address <span className="text-red-500">*</span>
              </label>
              <input
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="e.g. Near Men's Hostel Block B, VIT-AP"
                required
                className="w-full px-4 py-2.5 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-container-low] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">
                Tell us about your food
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="What makes your food special? Delivery hours, specialty items, etc."
                rows={3}
                className="w-full px-4 py-2.5 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-container-low] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-[--radius-full] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
              style={{ background: "var(--color-primary)" }}>
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {submitting ? "Submitting..." : "Submit Application"}
            </button>

            <p className="text-xs text-center text-[--color-on-surface-variant]">
              By submitting, you agree to VIT-AP Eats&apos; partner terms. We&apos;ll review and respond within 24 hours.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
