import { useState } from "react";
import dynamic from "next/dynamic";
import { Search, Bike, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Dynamically import the map component with SSR disabled
const Map = dynamic(() => import("./Map"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
      <Loader2 className="animate-spin mb-2" size={24} />
      <span className="text-sm font-semibold">Loading Map...</span>
    </div>
  )
});

export function PartnersTab({ partners }: { partners: any[] }) {
  const [search, setSearch] = useState("");

  const filtered = partners.filter(p => 
    p.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-4">
      {/* Map Area */}
      <div className="flex-1 bg-gray-100 rounded-[--radius-lg] overflow-hidden border border-[--color-border] shadow-inner relative min-h-[400px]">
        <Map partners={partners} />
      </div>

      {/* Sidebar List */}
      <div className="w-full lg:w-80 flex flex-col bg-[--color-surface-container-lowest] rounded-[--radius-lg] border border-[--color-border] shadow-[--shadow-sm] overflow-hidden">
        <div className="p-3 border-b border-[--color-border] bg-gray-50/50">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search partners..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary] transition-shadow"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 hide-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Bike size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No partners found</p>
            </div>
          ) : (
            filtered.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {p.full_name[0]}
                  </div>
                  <div className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                    p.is_online ? "bg-green-500" : "bg-gray-400"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{p.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {p.rating} ★ · {p.total_deliveries} deliveries
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
