"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, UploadCloud, Loader2, Save, Image as ImageIcon, CheckCircle2, Package, DollarSign, Tag as TagIcon, LayoutGrid, X } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

// --- Types ---
interface ImageSlot {
  id: string;
  url: string | null;
  file: File | null;
  isUploading: boolean;
  progress: number;
}

interface Variant {
  id: string;
  color: string;
  size: string;
  price: number | "";
  stock: number | "";
  imageUrl: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  initialData?: {
    id?: string;
    title: string;
    description: string;
    categoryId: string;
    tags: string[];
    variants: any[];
  };
  mode: "create" | "edit";
}

// --- Subcomponent for Individual Upload Slots ---
const ImageSlotItem = ({ 
  slotData, 
  onUpdate, 
  onRemove,
  canRemove,
  index
}: { 
  slotData: ImageSlot; 
  onUpdate: (id: string, updates: Partial<ImageSlot>) => void; 
  onRemove: (id: string) => void;
  canRemove: boolean;
  index: number;
}) => {
  const { startUpload } = useUploadThing("productImages", {
    onUploadProgress: (p) => {
      onUpdate(slotData.id, { progress: p });
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    onUpdate(slotData.id, { file, isUploading: true, progress: 0, url: null });
    
    try {
      const res = await startUpload([file]);
      if (res && res[0]) {
        onUpdate(slotData.id, { url: res[0].url, isUploading: false, progress: 100 });
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (e) {
      console.error(e);
      onUpdate(slotData.id, { isUploading: false, progress: 0, file: null });
      alert("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="relative group p-4 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors flex flex-col items-center justify-center min-h-[160px] overflow-hidden">
      <div className="absolute top-2 left-2 w-6 h-6 bg-gray-900/80 text-gray-300 rounded-full flex items-center justify-center text-xs font-bold z-20 backdrop-blur-sm border border-gray-700">
        {index + 1}
      </div>
      {slotData.url ? (
        <div className="absolute inset-0 w-full h-full">
          <img src={slotData.url} alt="Uploaded preview" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
        </div>
      ) : (
        <>
          {slotData.isUploading ? (
            <div className="flex flex-col items-center gap-3 z-10 w-full px-6">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${slotData.progress}%` }}></div>
              </div>
              <span className="text-xs text-blue-400 font-medium">{Math.round(slotData.progress)}% Uploading</span>
            </div>
          ) : (
             <div className="flex flex-col items-center gap-2 z-10 cursor-pointer pointer-events-none">
              <UploadCloud className="w-8 h-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Click to upload image</span>
              <span className="text-xs text-gray-500">JPG, PNG up to 16MB</span>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleFileChange}
            disabled={slotData.isUploading}
          />
        </>
      )}
      
      {canRemove && (
        <button 
          type="button"
          onClick={() => onRemove(slotData.id)}
          disabled={slotData.isUploading}
          className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md z-20 backdrop-blur-sm transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  
  // Category State
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);

  // Tags State
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  
  // Images Mapping
  // For Edit mode, we want to pre-fill the slots with existing variant images
  const initialImages: ImageSlot[] = (initialData?.variants || []).reduce((acc: ImageSlot[], v: any) => {
    if (v.imageUrl && !acc.some(img => img.url === v.imageUrl)) {
      acc.push({ id: `slot-${acc.length + 1}`, url: v.imageUrl, file: null, isUploading: false, progress: 100 });
    }
    return acc;
  }, []);

  // Ensure at least 2 slots total
  while (initialImages.length < 2) {
    initialImages.push({ id: `slot-${initialImages.length + 1}`, url: null, file: null, isUploading: false, progress: 0 });
  }

  const [images, setImages] = useState<ImageSlot[]>(initialImages);
  
  const [variants, setVariants] = useState<Variant[]>(
    initialData?.variants.map((v: any) => ({
      id: v.id || `var-${Math.random()}`,
      color: v.color,
      size: v.size,
      price: v.price,
      stock: v.stock,
      imageUrl: v.imageUrl
    })) || [
      { id: "var-1", color: "", size: "", price: "", stock: "", imageUrl: "" }
    ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
        setIsFetchingCategories(false);
      })
      .catch(() => setIsFetchingCategories(false));
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName })
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(prev => [...prev, data]);
        setCategoryId(data.id);
        setIsCreatingCategory(false);
        setNewCategoryName("");
      } else {
        alert(data.error || "Failed to create category");
      }
    } catch(e) {
      alert("Error creating category");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags(prev => [...prev, val]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const isAnyUploading = images.some(img => img.isUploading);
  const availableImages = images.map((img, idx) => ({ url: img.url as string, index: idx + 1 })).filter(img => img.url);

  const updateImageSlot = (id: string, updates: Partial<ImageSlot>) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  const removeImageSlot = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    const removedImg = images.find(i => i.id === id);
    if (removedImg && removedImg.url) {
      setVariants(prev => prev.map(v => 
        v.imageUrl === removedImg.url ? { ...v, imageUrl: "" } : v
      ));
    }
  };

  const addImageSlot = () => {
    setImages(prev => [...prev, { id: `slot-${Date.now()}`, url: null, file: null, isUploading: false, progress: 0 }]);
  };

  const updateVariant = (id: string, field: keyof Variant, value: string | number) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { id: `var-${Date.now()}`, color: "", size: "", price: "", stock: "", imageUrl: "" }]);
  };

  const removeVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyUploading) return;
    
    if (!title.trim() || !description.trim()) {
      alert("Title and description are required.");
      return;
    }
    
    for (const v of variants) {
      if (!v.color || !v.size || v.price === "" || v.stock === "" || !v.imageUrl) {
        alert("All variant fields are required, including assigning an image.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        categoryId: categoryId || undefined,
        tags,
        variants: variants.map(v => ({
           id: mode === "edit" ? v.id : undefined,
           color: v.color, 
           size: v.size, 
           price: Number(v.price), 
           stock: Number(v.stock), 
           imageUrl: v.imageUrl
        }))
      };

      const endpoint = mode === "create" ? "/api/products" : `/api/products/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(mode === "create" ? "Product created successfully!" : "Product updated successfully!");
        router.push("/admin/products");
      } else {
        throw new Error(data.error || "Failed to save product");
      }
    } catch(err: any) {
      alert(err.message || "An error occurred while saving the product.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id || !confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${initialData.id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Product deleted successfully.");
        router.push("/admin/products");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete product");
      }
    } catch(e: any) {
      alert(e.message || "Error deleting product");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 md:p-12 mb-20 font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              {mode === "create" ? "Create New Product" : "Edit Product"}
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              {mode === "create" ? "Fill in the details, upload images, and configure variants." : "Modify the existing product details."}
            </p>
          </div>
          <div className="flex items-center gap-3">
             {mode === "edit" && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting || isAnyUploading}
                  className="px-6 py-2.5 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/50 rounded-lg font-medium transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Product"}
                </button>
             )}
             <button
              onClick={handleSubmit}
              disabled={isAnyUploading || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20"
            >
              {isAnyUploading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Uploading Images... </>
              ) : isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving... </>
              ) : (
                <><Save className="w-5 h-5" /> {mode === "create" ? "Publish Product" : "Save Changes"}</>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-8 backdrop-blur-xl">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Vintage Leather Jacket"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-purple-400" /> Category</span>
                </label>
                
                {isCreatingCategory ? (
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder="New category name"
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-purple-500/50"
                      autoFocus
                    />
                    <button type="button" onClick={handleCreateCategory} className="px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors">Save</button>
                    <button type="button" onClick={() => setIsCreatingCategory(false)} className="px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors">Cancel</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select 
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="">Select a category...</option>
                      {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                    </select>
                    <button type="button" onClick={() => setIsCreatingCategory(true)} className="px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-purple-400 rounded-xl text-sm font-medium transition-colors flex items-center whitespace-nowrap"><Plus className="w-4 h-4" /> New</button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-indigo-400" /> Tags
                </label>
                <div className="bg-gray-950 border border-gray-700 rounded-xl p-2 min-h-[50px] flex gap-2 flex-wrap items-center focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-100 transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "Type a tag and press Enter..." : "Add tag..."}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-white text-sm px-2 py-1 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your product in detail..."
                  rows={4}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                  required
                />
              </div>
            </div>
          </section>

          <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-pink-400" />
                Product Media
              </h2>
              <button type="button" onClick={addImageSlot} className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors"><Plus className="w-4 h-4" /> Add Slot</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, i) => (
                <ImageSlotItem key={img.id} slotData={img} onUpdate={updateImageSlot} onRemove={removeImageSlot} canRemove={images.length > 2} index={i} />
              ))}
            </div>
          </section>

          <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 backdrop-blur-xl">
             <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Variants Config
              </h2>
              <button type="button" onClick={addVariant} className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-md transition-colors"><Plus className="w-4 h-4" /> Add Variant</button>
            </div>
            <div className="space-y-4">
              {variants.map((variant) => (
                <div key={variant.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-950/50 p-4 rounded-xl border border-gray-800/80">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Color</label>
                    <input type="text" value={variant.color} onChange={e => updateVariant(variant.id, "color", e.target.value)} placeholder="e.g. Black" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-blue-500" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Size</label>
                    <input type="text" value={variant.size} onChange={e => updateVariant(variant.id, "size", e.target.value)} placeholder="e.g. M, L, XL" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-blue-500" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Price ($)</label>
                    <input type="number" step="0.01" min="0" value={variant.price} onChange={e => updateVariant(variant.id, "price", e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-blue-500" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Stock</label>
                    <input type="number" min="0" value={variant.stock} onChange={e => updateVariant(variant.id, "stock", e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-blue-500" required />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Assigned Image</label>
                    <select value={variant.imageUrl} onChange={e => updateVariant(variant.id, "imageUrl", e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-blue-500 appearance-none" required >
                      <option value="" disabled>Select uploaded image...</option>
                      {availableImages.map(({ url, index }) => (<option key={url} value={url}>Image {index}</option>))}
                    </select>
                  </div>
                  <div className="md:col-span-1 flex justify-end pb-1 md:pb-0">
                    <button type="button" onClick={() => removeVariant(variant.id)} disabled={variants.length <= 1} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </form>
      </div>
    </div>
  );
}
