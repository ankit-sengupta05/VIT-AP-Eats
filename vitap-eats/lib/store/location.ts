import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationState {
  lat: number;
  lng: number;
  label: string;
  setLocation: (lat: number, lng: number, label: string) => void;
}

// Default to VIT-AP Campus center
const DEFAULT_LAT = 16.5028;
const DEFAULT_LNG = 80.5218;

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      lat: DEFAULT_LAT,
      lng: DEFAULT_LNG,
      label: "VIT-AP Campus, Amaravati",
      setLocation: (lat, lng, label) => set({ lat, lng, label }),
    }),
    {
      name: "vitap-eats-location",
    }
  )
);
