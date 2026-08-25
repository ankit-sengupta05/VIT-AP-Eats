import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/shared/Providers";
import { OfflineBanner } from "@/components/OfflineBanner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { WebVitals } from "@/components/WebVitals";

export const metadata: Metadata = {
  title: { default: "VIT-AP Eats", template: "%s | VIT-AP Eats" },
  description: "Order food from the best restaurants near VIT-AP campus — fast delivery, live tracking.",
  keywords: ["food delivery", "VIT-AP", "restaurant", "order food"],
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "VIT-AP Eats", statusBarStyle: "default" },
  openGraph: {
    title: "VIT-AP Eats",
    description: "Order food from restaurants across VIT-AP University campus.",
    siteName: "VIT-AP Eats",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#6246ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        {/* PWA: Offline detection banner */}
        <OfflineBanner />
        {/* PWA: Install-to-homescreen prompt */}
        <PWAInstallPrompt />
        {/* Performance: Core Web Vitals instrumentation */}
        <WebVitals />
      </body>
    </html>
  );
}
