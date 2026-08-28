"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import { rupees, cn } from "@/lib/utils";
import { getRestaurants, getAllRestaurants, type Restaurant } from "@/lib/db/restaurants";
import {
  getMenuByRestaurant, addMenuItem, updateMenuItem, deleteMenuItem, type MenuItem,
} from "@/lib/db/items";

// ── Form defaults ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  imageUrl: "",
  isVeg: false,
  isAvailable: true,
};

// ── Small modal component ──────────────────────────────────────────────────
function ItemModal({
  title,
  form,
  categories,
  onChange,
  onSave,
  onClose,
  saving,
}: {
  title: string;
  form: typeof EMPTY_FORM;
  categories: string[];
  onChange: (k: keyof typeof EMPTY_FORM, v: string | boolean) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [isCustomCategory, setIsCustomCategory] = useState(
    form.category ? !categories.includes(form.category) : false
  );

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
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Item Name *</label>
              <input value={form.name} onChange={e => onChange("name", e.target.value)}
                placeholder="e.g. Chicken Biryani"
                className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Description</label>
              <textarea value={form.description} onChange={e => onChange("description", e.target.value)}
                placeholder="Short description of the item"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Price (₹) *</label>
              <input type="number" min="0" value={form.price} onChange={e => onChange("price", e.target.value)}
                placeholder="e.g. 120"
                className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Category *</label>
              {!isCustomCategory ? (
                <select
                  value={form.category}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setIsCustomCategory(true);
                      onChange("category", "");
                    } else {
                      onChange("category", e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                >
                  <option value="" disabled>Select category...</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__custom__">+ Add Custom Category</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={form.category}
                    onChange={(e) => onChange("category", e.target.value)}
                    placeholder="e.g. Biryani"
                    autoFocus
                    className="flex-1 px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(false);
                      onChange("category", "");
                    }}
                    className="px-3 py-2 rounded-lg border border-[--color-border] text-[--color-on-surface-variant] hover:bg-[--color-surface-container-low]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-[--color-on-surface] mb-1">Image URL (optional)</label>
              <input value={form.imageUrl} onChange={e => onChange("imageUrl", e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]" />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onChange("isVeg", !form.isVeg)}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors",
                  form.isVeg ? "bg-green-50 border-green-400 text-green-700" : "bg-red-50 border-red-300 text-red-700")}
              >
                <span className={cn("w-3 h-3 rounded-full", form.isVeg ? "bg-green-500" : "bg-red-500")} />
                {form.isVeg ? "Veg" : "Non-Veg"}
              </button>
              <button
                type="button"
                onClick={() => onChange("isAvailable", !form.isAvailable)}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors",
                  form.isAvailable ? "bg-blue-50 border-blue-400 text-blue-700" : "bg-gray-100 border-gray-300 text-gray-500")}
              >
                {form.isAvailable ? "Available" : "Hidden"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[--color-border] bg-[--color-surface-container]">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-[--color-border] text-[--color-on-surface] hover:bg-[--color-surface-container-high] transition-colors">Cancel</button>
          <button
            onClick={onSave}
            disabled={saving || !form.name || !form.price || !form.category}
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
export function MenuTab() {
  const [restaurants, setRestaurants]   = useState<Restaurant[]>([]);
  const [selectedRestId, setSelectedRestId] = useState<string>("");
  const [menu, setMenu]                 = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState("");

  // Modal state
  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState<MenuItem | null>(null);
  const [form, setForm]                 = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    try {
      const data = await getAllRestaurants();
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRestaurants(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (selectedRestId) fetchMenu(selectedRestId); }, [selectedRestId]);

  // ── Form helpers ──────────────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditTarget(item);
    setForm({
      name:        item.name,
      description: item.description ?? "",
      price:       String(item.price),
      category:    item.category,
      imageUrl:    item.imageUrl ?? "",
      isVeg:       item.isVeg,
      isAvailable: item.isAvailable,
    });
    setShowModal(true);
  };

  const handleChange = (k: keyof typeof EMPTY_FORM, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category || !selectedRestId) return;
    setSaving(true);
    try {
      const payload = {
        name:         form.name.trim(),
        description:  form.description.trim(),
        price:        Number(form.price),
        category:     form.category.trim(),
        imageUrl:     form.imageUrl.trim(),
        isVeg:        form.isVeg,
        isAvailable:  form.isAvailable,
        restaurantId: selectedRestId,
      };

      if (editTarget) {
        await updateMenuItem(editTarget.id, payload);
        setMenu(prev => prev.map(m => m.id === editTarget.id ? { ...m, ...payload } : m));
        toast.success("Item updated!");
      } else {
        const id = await addMenuItem(payload);
        setMenu(prev => [...prev, { id, ...payload }]);
        toast.success("Item added!");
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      await deleteMenuItem(item.id);
      setMenu(prev => prev.filter(m => m.id !== item.id));
      toast.success(`"${item.name}" deleted`);
    } catch (err: any) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvail = async (item: MenuItem) => {
    const newVal = !item.isAvailable;
    setMenu(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: newVal } : m));
    try {
      await updateMenuItem(item.id, { isAvailable: newVal });
      toast.success(`${item.name} is now ${newVal ? "Available" : "Hidden"}`);
    } catch {
      toast.error("Failed to update availability");
      setMenu(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: !newVal } : m));
    }
  };

  const filtered = menu.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    menu.forEach(m => cats.add(m.category));
    return Array.from(cats).sort();
  }, [menu]);

  return (
    <div className="space-y-6">
      {/* Modal */}
      {showModal && (
        <ItemModal
          title={editTarget ? "Edit Item" : "Add New Item"}
          form={form}
          categories={categories}
          onChange={handleChange}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          saving={saving}
        />
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-bold text-[--color-on-surface] text-lg" style={{ fontFamily: "var(--font-heading)" }}>Menu Management</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedRestId}
            onChange={(e) => setSelectedRestId(e.target.value)}
            className="px-3 py-2 rounded-md border border-[--color-border] bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm font-medium focus:ring-2 focus:ring-[--color-primary] outline-none"
          >
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button onClick={openAdd} className="px-4 py-2 text-white rounded-md text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity" style={{ background: "var(--color-primary)" }}>
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
          <button onClick={openAdd} className="mt-3 px-4 py-2 text-white rounded-md text-sm font-bold" style={{ background: "var(--color-primary)" }}>
            Add your first item
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-bold text-lg text-[--color-on-surface] mb-3 border-b border-[--color-border] pb-2">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {(items as MenuItem[]).map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "bg-[--color-surface-container-lowest] rounded-[--radius-lg] border p-4 flex gap-4 transition-all",
                      deletingId === item.id && "opacity-40",
                      !item.isAvailable ? "border-[--color-border] opacity-60" : "border-[--color-border] shadow-[--shadow-sm] hover:border-[--color-primary]"
                    )}
                  >
                    <div className="w-16 h-16 rounded-md flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden bg-[--color-surface-container-low] text-[--color-on-surface-variant]">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-md" /> : "No Img"}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-sm text-[--color-on-surface] truncate flex items-center gap-1.5">
                            <span className={cn("w-2 h-2 rounded-full shrink-0", item.isVeg ? "bg-[--color-success]" : "bg-[--color-error]")} />
                            {item.name}
                          </p>
                          <span className="font-extrabold text-sm text-[--color-on-surface] tabular-nums shrink-0">{rupees(item.price)}</span>
                        </div>
                        <p className="text-xs text-[--color-on-surface-variant] line-clamp-1 mt-0.5">{item.description || "No description"}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <button
                          onClick={() => handleToggleAvail(item)}
                          className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition-colors",
                            item.isAvailable ? "text-green-700 bg-green-50 hover:bg-green-100" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
                        >
                          {item.isAvailable ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          {item.isAvailable ? "Available" : "Hidden"}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 text-gray-400 hover:text-[--color-primary] hover:bg-orange-50 rounded transition-colors"
                            title="Edit item"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                            title="Delete item"
                          >
                            {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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
