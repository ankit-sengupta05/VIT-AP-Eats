"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronLeft, Mail, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next") ?? "/";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(nextParam);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[--color-surface-container-lowest] rounded-[--radius-lg] shadow-[--shadow-lg] p-6 md:p-8 border border-[--color-border]">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-[--radius-md] flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-[--shadow-md]" style={{ background: "var(--color-primary)" }}>
          VE
        </div>
        <h1 className="text-2xl font-extrabold text-[--color-on-surface] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Welcome Back
        </h1>
        <p className="text-sm text-[--color-on-surface-variant]">
          Log in to order from your favorite campus spots
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-[--radius-md] bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
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
        <div>
          <label className="block text-sm font-semibold text-[--color-on-surface] mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-[--color-border] rounded-[--radius-md] focus:outline-none focus:border-[--color-primary] bg-[--color-surface-container-lowest]"
            required
          />
        </div>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 text-white font-bold text-base rounded-[--radius-md] shadow-[--shadow-md] hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          style={{ background: "var(--color-primary)" }}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Log in <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="text-center text-sm text-[--color-on-surface-variant] mt-6">
        Don&apos;t have an account? <Link href={`/signup?next=${encodeURIComponent(nextParam)}`} className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>Sign up</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[--color-bg] flex flex-col">
      <header className="px-4 md:px-10 h-16 flex items-center border-b border-[--color-border] bg-[--color-surface-container-lowest]">
        <Link href="/" className="flex items-center gap-2 text-[--color-on-surface-variant] hover:text-[--color-on-surface] transition-colors">
          <ChevronLeft size={20} />
          <span className="font-semibold text-sm">Back</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center p-4">
        <Suspense fallback={<div className="w-8 h-8 rounded-full border-4 border-[--color-primary] border-t-transparent animate-spin" />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
