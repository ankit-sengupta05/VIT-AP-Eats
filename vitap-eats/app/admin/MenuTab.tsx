import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";
import toast from "react-hot-toast";
import { rupees, cn } from "@/lib/utils";
import { getRestaurants, type Restaurant } from "@/lib/db/restaurants";
import { getMenuByRestaurant, updateMenuItem, type MenuItem } from "@/lib/db/items";

export function MenuTab() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestId, setSelectedRestId] = useState<string>("");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRestaurants = useCallback(async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
      if (data.length > 0) setSelectedRestId(data[0].id);
    } catch {
      toast.error("Failed to load restaurants");
    }
  }, []);

  const fetchMenu = useCallback(async (restId: string) => {
    setIsLoading(true);
    try {
      const data = await getMenuByRestaurant(restId);
      setMenu(data);
    } catch {
      toast.error("Failed to load menu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);
  
  useEffect(() => {
    if (selectedRestId) fetchMenu(selectedRestId);
  }, [selectedRestId, fetchMenu]);

  const handleToggleAvail = async (item: MenuItem) => {
    const newVal = !item.isAvailable;
    try {
      // Optimistic update
      setMenu(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: newVal } : m));
      await updateMenuItem(item.id, { isAvailable: newVal });
      toast.success(`${item.name} is now ${newVal ? 'Available' : 'Unavailable'}`);
    } catch {
      toast.error("Failed to update availability");
      // Revert on error
      setMenu(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: !newVal } : m));
    }
  };

  const filtered = menu.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()));

  // Group by category
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-bold text-[--color-on-surface] text-lg" style={{ fontFamily: "var(--font-heading)" }}>Menu Management</h2>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedRestId} 
            onChange={(e) => setSelectedRestId(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[--color-primary] outline-none"
          >
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button className="px-4 py-2 bg-[--color-primary] text-white rounded-md text-sm font-bold flex items-center gap-2 hover:opacity-90">
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search items or categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md bg-[--color-surface-container-lowest] border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
        />
      </div>

      {/* Menu List */}
      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-gray-400" /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 bg-[--color-surface-container-lowest] rounded-[--radius-lg] border border-[--color-border] border-dashed">
          <p className="font-semibold text-[--color-on-surface-variant]">No menu items found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-bold text-lg text-gray-800 mb-3 border-b border-gray-200 pb-2">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {(items as MenuItem[]).map((item) => (
                  <div key={item.id} className={cn("bg-white rounded-[--radius-lg] border p-4 flex gap-4 transition-colors", !item.isAvailable ? "bg-gray-50 border-gray-200" : "border-gray-200 shadow-sm hover:border-[--color-primary]")}>
                    <div className={cn("w-16 h-16 rounded-md flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden", item.imageUrl ? "" : "bg-gray-100 text-gray-400")}>
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-md" /> : "No Img"}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-sm text-gray-900 truncate flex items-center gap-1.5">
                            <span className={cn("w-2 h-2 rounded-full", item.isVeg ? "bg-green-500" : "bg-red-500")} />
                            {item.name}
                          </p>
                          <span className="font-extrabold text-sm text-gray-900 tabular-nums">{rupees(item.price)}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.description || "No description"}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <button 
                          onClick={() => handleToggleAvail(item)}
                          className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition-colors", item.isAvailable ? "text-green-700 bg-green-50 hover:bg-green-100" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
                        >
                          {item.isAvailable ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          {item.isAvailable ? "Available" : "Hidden"}
                        </button>

                        <div className="flex items-center gap-1">
                          <button className="p-1.5 text-gray-400 hover:text-[--color-primary] hover:bg-indigo-50 rounded transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
