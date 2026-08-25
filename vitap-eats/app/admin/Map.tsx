"use client";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const activeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const offlineIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Map({ partners }: { partners: any[] }) {
  // Center on VIT-AP rough coordinates
  const center: [number, number] = [16.498, 80.500];

  return (
    <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%", zIndex: 1 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {partners.map(p => {
        const loc = p.delivery_partner_locations?.[0] ?? p.delivery_partner_locations;
        if (!loc || !loc.lat || !loc.lng) return null;
        
        return (
          <Marker 
            key={p.id} 
            position={[loc.lat, loc.lng]} 
            icon={p.is_online ? activeIcon : offlineIcon}
          >
            <Popup>
              <div className="font-sans">
                <p className="font-bold text-sm m-0">{p.full_name}</p>
                <p className="text-xs text-gray-500 m-0 mt-0.5">{p.is_online ? "🟢 Online" : "⚫ Offline"}</p>
                <div className="mt-2 text-xs">
                  <p className="m-0">Deliveries today: <b>{p.total_deliveries}</b></p>
                  <p className="m-0">Earnings: <b>₹{p.today_earnings}</b></p>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
