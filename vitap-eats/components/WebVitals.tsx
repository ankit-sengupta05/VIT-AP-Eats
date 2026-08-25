"use client";
import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in all environments for now.
    // In production, replace with your analytics endpoint (e.g. POST /api/vitals).
    if (process.env.NODE_ENV === "development") {
      const isGood =
        (metric.name === "LCP" && metric.value < 2500) ||
        (metric.name === "CLS" && metric.value < 0.1)  ||
        (metric.name === "INP" && metric.value < 200)  ||
        (metric.name === "FCP" && metric.value < 1800) ||
        (metric.name === "TTFB" && metric.value < 800);

      const status = isGood ? "✅" : "⚠️";
      console.log(`[WebVitals] ${status} ${metric.name}: ${Math.round(metric.value)}ms (rating: ${metric.rating})`);
    }

    // Production: send to analytics endpoint
    if (process.env.NODE_ENV === "production") {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        navigationType: metric.navigationType,
      });

      // Use sendBeacon if available for non-blocking reporting
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/vitals", body);
      } else {
        fetch("/api/vitals", { method: "POST", body, keepalive: true }).catch(() => {});
      }
    }
  });

  return null;
}
