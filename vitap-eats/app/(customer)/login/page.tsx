"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[--color-bg] flex flex-col">
      {/* Header */}
      <header className="px-4 md:px-10 h-16 flex items-center border-b border-[--color-border] bg-[--color-surface-container-lowest]">
        <Link href="/" className="flex items-center gap-2 text-[--color-on-surface-variant] hover:text-[--color-on-surface] transition-colors">
          <ChevronLeft size={20} />
          <span className="font-semibold text-sm">Back</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center p-4">
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

          {/* Toggle Method */}
          <div className="flex p-1 bg-[--color-surface-container] rounded-[--radius-md] mb-6">
            <button
              onClick={() => setMethod("phone")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-[--radius-sm] transition-all",
                method === "phone" ? "bg-[--color-surface-container-lowest] shadow-[--shadow-sm] text-[--color-on-surface]" : "text-[--color-on-surface-variant] hover:text-[--color-on-surface]"
              )}
            >
              <Phone size={16} /> Phone
            </button>
            <button
              onClick={() => setMethod("email")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-[--radius-sm] transition-all",
                method === "email" ? "bg-[--color-surface-container-lowest] shadow-[--shadow-sm] text-[--color-on-surface]" : "text-[--color-on-surface-variant] hover:text-[--color-on-surface]"
              )}
            >
              <Mail size={16} /> Email
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {method === "phone" ? (
              <div>
                <label className="block text-sm font-semibold text-[--color-on-surface] mb-1.5">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-[--radius-md] border border-r-0 border-[--color-border] bg-[--color-surface-container-low] text-[--color-on-surface-variant] text-sm font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="90000 12345"
                    className="flex-1 px-4 py-3 border border-[--color-border] rounded-r-[--radius-md] focus:outline-none focus:border-[--color-primary] bg-[--color-surface-container-lowest]"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-[--color-on-surface] mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="name@vitap.ac.in"
                  className="w-full px-4 py-3 border border-[--color-border] rounded-[--radius-md] focus:outline-none focus:border-[--color-primary] bg-[--color-surface-container-lowest]"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3.5 text-white font-bold text-base rounded-[--radius-md] shadow-[--shadow-md] hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: "var(--color-primary)" }}
            >
              {isLoading ? (
                "Sending OTP..."
              ) : (
                <>
                  Continue <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[--color-on-surface-variant] mt-6">
            By continuing, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
