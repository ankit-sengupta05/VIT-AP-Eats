"use client";
import { useCallback } from "react";

// In production, this would be swapped with PostHog, Mixpanel, or Google Analytics
// e.g. import posthog from 'posthog-js'

export type AnalyticsEvent = 
  | "signup"
  | "search"
  | "add_to_cart"
  | "checkout_started"
  | "checkout_completed"
  | "order_status_viewed";

export function useAnalytics() {
  const track = useCallback((event: AnalyticsEvent, properties?: Record<string, any>) => {
    // Development logging
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] 📊 Event: ${event}`, properties || "");
    }

    // Production: send to mock endpoint (or actual analytics provider)
    if (process.env.NODE_ENV === "production") {
      const payload = JSON.stringify({ event, properties, timestamp: new Date().toISOString() });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics", payload);
      } else {
        fetch("/api/analytics", { method: "POST", body: payload, keepalive: true }).catch(() => {});
      }
    }
  }, []);

  return { track };
}
