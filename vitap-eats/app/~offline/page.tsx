"use client";
import Link from "next/link";
import { WifiOff, Home, RotateCcw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6"
      style={{ background: "var(--color-bg)" }}>
      
      <div className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{ background: "var(--color-surface-container-low)" }}>
        <WifiOff size={44} className="text-[--color-on-surface-variant] opacity-60" />
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-[--color-on-surface] mb-2"
          style={{ fontFamily: "var(--font-heading)" }}>
          You&apos;re Offline
        </h1>
        <p className="text-[--color-on-surface-variant] text-sm max-w-xs">
          It looks like you don&apos;t have a network connection. Check your Wi-Fi or mobile data and try again.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-[--radius-full] text-white font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ background: "var(--color-primary)" }}
        >
          <RotateCcw size={16} /> Retry
        </button>
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-[--radius-full] font-bold text-sm border border-[--color-border] text-[--color-on-surface] hover:bg-[--color-surface-container-low] transition-colors"
        >
          <Home size={16} /> Home
        </Link>
      </div>

      <p className="text-xs text-[--color-on-surface-variant] opacity-60 mt-2">
        Previously visited pages may still be available from cache.
      </p>
    </div>
  );
}
