"use client";
import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };
    const handleOnline = () => {
      // Keep banner briefly visible while we show "back online" state
      setTimeout(() => setIsOffline(false), 2500);
    };

    const t = setTimeout(() => setIsOffline(!navigator.onLine), 0);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      clearTimeout(t);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !wasOffline) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[500] flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold transition-all duration-500 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
      style={{
        background: isOffline ? "#ef4444" : "#22c55e",
        color: "white",
        transform: (isOffline || wasOffline) ? "translateY(0)" : "translateY(100%)",
      }}
    >
      {isOffline ? (
        <>
          <WifiOff size={16} />
          You&apos;re offline — some features may be unavailable
        </>
      ) : (
        <>
          ✓ Back online!
        </>
      )}
    </div>
  );
}
