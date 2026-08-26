"use client";
import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSPromptVisible, setIsIOSPromptVisible] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const dismissed = sessionStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) return;

    // iOS detection
    const ua = navigator.userAgent;
    const isIOSDevice = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream;
    const isInStandaloneMode = (window.navigator as any).standalone === true;

    if (isIOSDevice && !isInStandaloneMode) {
      setIsIOS(true);
      // Show iOS prompt after 5s
      setTimeout(() => setIsIOSPromptVisible(true), 5000);
      return;
    }

    // Android/Chrome: capture beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      // Delay showing for 3 seconds to not immediately interrupt the user
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
      setPromptEvent(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsIOSPromptVisible(false);
    sessionStorage.setItem("pwa-prompt-dismissed", "1");
  };

  // ── Android / Chrome prompt ──────────────────────────────────────────────
  if (isVisible && promptEvent) {
    return (
      <div className="fixed bottom-20 inset-x-4 sm:inset-x-auto sm:right-4 sm:w-80 z-[400] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-slide-up">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-72x72.png" alt="App Icon" className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">Install VIT-AP Eats</p>
            <p className="text-xs text-gray-500 mt-0.5">Add to your home screen for the best experience — faster access, works offline!</p>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 shrink-0 -mt-1">
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={handleDismiss}
            className="flex-1 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Not now
          </button>
          <button onClick={handleInstall}
            className="flex-1 py-2 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            style={{ background: "var(--color-primary)" }}>
            <Download size={13} /> Install App
          </button>
        </div>
      </div>
    );
  }

  // ── iOS manual instructions ──────────────────────────────────────────────
  if (isIOS && isIOSPromptVisible) {
    return (
      <div className="fixed bottom-0 inset-x-0 z-[400] bg-white border-t border-gray-100 shadow-2xl rounded-t-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-gray-900">Install VIT-AP Eats</p>
          <button onClick={handleDismiss} className="text-gray-400">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          To install on iOS, tap the <strong>Share</strong> icon (📤) in Safari and then tap <strong>&quot;Add to Home Screen&quot;</strong>.
        </p>
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 text-sm">
          <span className="text-xl">📤</span>
          <div>
            <p className="font-semibold text-gray-800">Share → Add to Home Screen</p>
            <p className="text-xs text-gray-500">Open in Safari to install</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
