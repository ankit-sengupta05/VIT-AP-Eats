import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/shared/Providers";

export const metadata: Metadata = {
  title: { default: "VIT-AP Eats", template: "%s | VIT-AP Eats" },
  description: "Order food from the best restaurants near VIT-AP campus — fast delivery, live tracking.",
  keywords: ["food delivery", "VIT-AP", "restaurant", "order food"],
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "VIT-AP Eats", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#FF5200",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
