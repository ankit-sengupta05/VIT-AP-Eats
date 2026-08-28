"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, X, Check, Store } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  getAllRestaurants, addRestaurant, updateRestaurant, deleteRestaurant, type Restaurant,
} from "@/lib/db/restaurants";
import { serverTimestamp } from "firebase/firestore";
import Image from "next/image";

// ── Form defaults ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "",
  cuisine: "",
  rating: "0",
  deliveryTime: "30",
  deliveryFee: "0",
  imageUrl: "",
  isOpen: true,
  isVeg: false,
  phone: "",
  address: "",
  partnerId: "",
};

// ── Modal Component ────────────────────────────────────────────────────────
function RestaurantModal({
  title,
  form,
  onChange,
  onSave,
  onClose,
  saving,
}: {
  title: string;
  form: typeof EMPTY_FORM;
  onChange: (k: keyof typeof EMPTY_FORM, v: string | boolean) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ backgroundColor: "var(--color-surface-container-lowest)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--color-border]">
          <h3 className="font-bold text-lg text-[--color-on-surface]">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[--color-surface-container-low]">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Restaurant Name *</label>
              <input value={form.name} onChange={e => onChange("name", e.target.value)}
                placeholder="e.g. VIT Bites"
                className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Cuisine *</label>
              <input value={form.cuisine} onChange={e => onChange("cuisine", e.target.value)}
                placeholder="e.g. Fast Food"
                className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Rating</label>
              <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => onChange("rating", e.target.value)}
                placeholder="e.g. 4.5"
                className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Delivery Time (min)</label>
              <input type="number" min="0" value={form.deliveryTime} onChange={e => onChange("deliveryTime", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Delivery Fee (₹)</label>
              <input type="number" min="0" value={form.deliveryFee} onChange={e => onChange("deliveryFee", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Image URL (optional)</label>
              <input value={form.imageUrl} onChange={e => onChange("imageUrl", e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Phone Number</label>
              <input value={form.phone} onChange={e => onChange("phone", e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Partner UID (optional)</label>
              <input value={form.partnerId} onChange={e => onChange("partnerId", e.target.value)}
                placeholder="Firebase UID..."
                className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Address</label>
              <input value={form.address} onChange={e => onChange("address", e.target.value)}
                placeholder="Restaurant physical address..."
                className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]" />
            </div>
            
            <div className="col-span-2 flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => onChange("isVeg", !form.isVeg)}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors",
                  form.isVeg ? "bg-green-50 border-green-400 text-green-700" : "bg-red-50 border-red-300 text-red-700")}
              >
                <span className={cn("w-3 h-3 rounded-full", form.isVeg ? "bg-green-500" : "bg-red-500")} />
                {form.isVeg ? "Pure Veg" : "Serves Non-Veg"}
              </button>
              <button
                type="button"
                onClick={() => onChange("isOpen", !form.isOpen)}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors",
                  form.isOpen ? "bg-blue-50 border-blue-400 text-blue-700" : "bg-gray-100 border-gray-300 text-gray-500")}
              >
                {form.isOpen ? "Open" : "Closed"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[--color-border] bg-[--color-surface-container]">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-[--color-border] text-[--color-on-surface] hover:bg-[--color-surface-container-high] transition-colors">Cancel</button>
          <button
            onClick={onSave}
            disabled={saving || !form.name || !form.cuisine}
            className="px-4 py-2 text-sm font-bold rounded-lg text-white flex items-center gap-2 disabled:opacity-60 transition-colors hover:opacity-90"
            style={{ background: "var(--color-primary)" }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function RestaurantsTab() {
  const [restaurants, setRestaurants]   = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState("");

  // Modal state
  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState<Restaurant | null>(null);
  const [form, setForm]                 = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllRestaurants();
      setRestaurants(data);
    } catch {
      toast.error("Failed to load restaurants");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  // ── Form helpers ──────────────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (rest: Restaurant) => {
    setEditTarget(rest);
    setForm({
      name:         rest.name,
      cuisine:      rest.cuisine,
      rating:       String(rest.rating ?? 0),
      deliveryTime: String(rest.deliveryTime ?? 30),
      deliveryFee:  String(rest.deliveryFee ?? 0),
      imageUrl:     rest.imageUrl ?? "",
      isOpen:       rest.isOpen ?? true,
      isVeg:        rest.isVeg ?? false,
      phone:        (rest as Restaurant & { phone?: string }).phone ?? "",
      address:      (rest as Restaurant & { address?: string }).address ?? "",
      partnerId:    rest.partnerId ?? "",
    });
    setShowModal(true);
  };

  const handleChange = (k: keyof typeof EMPTY_FORM, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.cuisine) return;
    setSaving(true);
    try {
      const payload = {
        name:         form.name.trim(),
        slug:         form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        cuisine:      form.cuisine.trim(),
        rating:       Number(form.rating),
        deliveryTime: Number(form.deliveryTime),
        deliveryFee:  Number(form.deliveryFee),
        imageUrl:     form.imageUrl.trim(),
        isOpen:       form.isOpen,
        isVeg:        form.isVeg,
        phone:        form.phone.trim(),
        address:      form.address.trim(),
        partnerId:    form.partnerId.trim(),
        createdAt:    serverTimestamp(),
      };

      if (editTarget) {
        // We do not overwrite createdAt if it exists, so omit it from update payload
        const { createdAt, ...updatePayload } = payload;
        await updateRestaurant(editTarget.id, updatePayload);
        setRestaurants(prev => prev.map(r => r.id === editTarget.id ? { ...r, ...updatePayload } : r));
        toast.success("Restaurant updated!");
      } else {
        const payloadWithReviewCount = { ...payload, reviewCount: 0 };
        const id = await addRestaurant(payloadWithReviewCount as Restaurant);
        setRestaurants(prev => [...prev, { id, ...payloadWithReviewCount } as Restaurant]);
        toast.success("Restaurant created!");
      }
      setShowModal(false);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rest: Restaurant) => {
    if (!confirm(`Delete "${rest.name}"? This cannot be undone.`)) return;
    setDeletingId(rest.id);
    try {
      await deleteRestaurant(rest.id);
      setRestaurants(prev => prev.filter(r => r.id !== rest.id));
      toast.success(`"${rest.name}" deleted`);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message ?? "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleOpen = async (rest: Restaurant) => {
    const newVal = !rest.isOpen;
    setRestaurants(prev => prev.map(r => r.id === rest.id ? { ...r, isOpen: newVal } : r));
    try {
      await updateRestaurant(rest.id, { isOpen: newVal });
      toast.success(`${rest.name} is now ${newVal ? "Open" : "Closed"}`);
    } catch {
      toast.error("Failed to update status");
      setRestaurants(prev => prev.map(r => r.id === rest.id ? { ...r, isOpen: !newVal } : r));
    }
  };

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Modal */}
      {showModal && (
        <RestaurantModal
          title={editTarget ? "Edit Restaurant" : "Create New Restaurant"}
          form={form}
          onChange={handleChange}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          saving={saving}
        />
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-bold text-[--color-on-surface] text-lg" style={{ fontFamily: "var(--font-heading)" }}>Restaurants</h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchRestaurants} className="px-4 py-2 border border-[--color-border] text-[--color-on-surface-variant] rounded-md text-sm font-semibold hover:bg-[--color-surface-container-low] transition-colors">
            Refresh
          </button>
          <button onClick={openAdd} className="px-4 py-2 text-white rounded-md text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity" style={{ background: "var(--color-primary)" }}>
            <Plus size={16} /> Add Restaurant
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search restaurants by name or cuisine..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md bg-[--color-surface-container-lowest] border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-gray-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[--color-surface-container-lowest] rounded-[--radius-lg] border border-[--color-border] border-dashed">
          <Store size={48} className="mx-auto mb-3 text-[--color-on-surface-variant] opacity-40" />
          <p className="font-semibold text-[--color-on-surface-variant]">No restaurants found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((rest) => (
            <div
              key={rest.id}
              className={cn(
                "bg-[--color-surface-container-lowest] rounded-[--radius-lg] border p-4 transition-all flex flex-col",
                deletingId === rest.id && "opacity-40",
                !rest.isOpen ? "border-[--color-border] opacity-60" : "border-[--color-border] shadow-[--shadow-sm] hover:border-[--color-primary]"
              )}
            >
              <div className="flex gap-4 mb-3">
                <div className="relative w-14 h-14 rounded-md flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden bg-[--color-surface-container-low] text-[--color-on-surface-variant]">
                  {rest.imageUrl ? <Image src={rest.imageUrl} alt={rest.name} fill sizes="56px" className="object-cover" /> : "No Img"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", rest.isVeg ? "bg-[--color-success]" : "bg-[--color-error]")} />
                    <h3 className="font-bold text-[--color-on-surface] text-sm truncate">{rest.name}</h3>
                  </div>
                  <p className="text-xs text-[--color-on-surface-variant] truncate">{rest.cuisine}</p>
                  <p className="text-xs font-medium text-[--color-on-surface-variant] mt-1 tabular-nums">★ {rest.rating} · {rest.deliveryTime}m</p>
                </div>
              </div>
              
              <div className="mt-auto pt-3 border-t border-[--color-border] flex items-center justify-between">
                <button
                  onClick={() => handleToggleOpen(rest)}
                  className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition-colors",
                    rest.isOpen ? "text-blue-700 bg-blue-50 hover:bg-blue-100" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
                >
                  {rest.isOpen ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {rest.isOpen ? "Open" : "Closed"}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(rest)}
                    className="p-1.5 text-gray-400 hover:text-[--color-primary] hover:bg-orange-50 rounded transition-colors"
                    title="Edit restaurant"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(rest)}
                    disabled={deletingId === rest.id}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                    title="Delete restaurant"
                  >
                    {deletingId === rest.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
