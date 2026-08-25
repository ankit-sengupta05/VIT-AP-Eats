"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useLocationStore } from "@/lib/store/location";
import { Search, Loader2, Navigation } from "lucide-react";

// Import ALL of react-leaflet in a single dynamic component to avoid
// dynamically importing hooks, which is not allowed in Next.js.
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

export default function LocationPickerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { lat, lng, label, setLocation } = useLocationStore();
  const [tempLat, setTempLat] = useState(lat);
  const [tempLng, setTempLng] = useState(lng);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempLat(lat);
      setTempLng(lng);
    }
  }, [lat, lng, isOpen]);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetecting(false);
        setTempLat(pos.coords.latitude);
        setTempLng(pos.coords.longitude);
      },
      () => {
        setIsDetecting(false);
        alert("Unable to get your location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async () => {
    let newLabel = `${tempLat.toFixed(4)}, ${tempLng.toFixed(4)}`;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${tempLat}&lon=${tempLng}`);
      const data = await res.json();
      if (data?.display_name) {
        const parts = data.display_name.split(",");
        newLabel = parts.slice(0, 2).join(",").trim();
      }
    } catch { /* ignore geocoding errors gracefully */ }

    setLocation(tempLat, tempLng, newLabel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[--color-surface-container-lowest] w-full max-w-2xl rounded-[--radius-lg] shadow-[--shadow-xl] overflow-hidden flex flex-col h-[80vh] max-h-[700px]">
        {/* Header */}
        <div className="p-4 border-b border-[--color-border] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[--color-on-surface]" style={{ fontFamily: "var(--font-heading)" }}>
              Select Delivery Location
            </h2>
            <p className="text-sm text-[--color-on-surface-variant]">Click on the map to pin your location</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[--color-surface-container-low] rounded-full transition-colors text-[--color-on-surface-variant] text-lg leading-none">
            ✕
          </button>
        </div>

        {/* Detect button */}
        <div className="p-4 flex gap-3">
          <button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[--radius-md] border border-[--color-primary] text-[--color-primary] font-semibold text-sm hover:bg-[--color-primary-fixed] transition-colors disabled:opacity-70"
          >
            {isDetecting ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
            Use Current Location
          </button>
          <div className="text-xs text-[--color-on-surface-variant] self-center ml-auto">
            {tempLat.toFixed(4)}, {tempLng.toFixed(4)}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-0">
          <LeafletMap
            lat={tempLat}
            lng={tempLng}
            onPositionChange={(newLat, newLng) => {
              setTempLat(newLat);
              setTempLng(newLng);
            }}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[--color-border] flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-2.5 rounded-[--radius-md] text-white font-bold shadow-[--shadow-md] hover:opacity-90 transition-opacity"
            style={{ background: "var(--color-primary)" }}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
