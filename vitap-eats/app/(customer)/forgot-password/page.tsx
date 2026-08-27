"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[--color-bg] flex flex-col">
      <header className="px-4 md:px-10 h-16 flex items-center border-b border-[--color-border] bg-[--color-surface-container-lowest]">
        <Link href="/login" className="flex items-center gap-2 text-[--color-on-surface-variant] hover:text-[--color-on-surface] transition-colors">
          <ChevronLeft size={20} />
          <span className="font-semibold text-sm">Back to Login</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-lg] p-6 md:p-8 border border-[--color-border]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-[--color-on-surface] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Reset Password
            </h1>
            <p className="text-sm text-[--color-on-surface-variant]">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-[--radius-md] bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-lg font-bold text-[--color-on-surface]">Check your email</h2>
              <p className="text-sm text-[--color-on-surface-variant]">
                We have sent a password reset link to <strong>{email}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[--color-on-surface] mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@vitap.ac.in"
                  className="w-full px-4 py-3 border border-[--color-border] rounded-[--radius-md] focus:outline-none focus:border-[--color-primary] bg-[--color-surface-container-lowest]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 text-white font-bold text-base rounded-[--radius-md] shadow-[--shadow-md] hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ background: "var(--color-primary)" }}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Send Reset Link <ArrowRight size={18} /></>}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
