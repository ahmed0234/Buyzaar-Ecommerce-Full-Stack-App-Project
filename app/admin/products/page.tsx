"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, LayoutGrid, Tag as TagIcon, ArrowRight, Package, Box, DollarSign, Loader2, Frown, X, Image as ImageIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  price: number;
  stock: number;
  imageUrl: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category?: Category;
  categoryId?: string;
  variants: Variant[];
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    // Initial fetch for categories
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, selectedTag]);

  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (selectedCategory) params.set("categoryId", selectedCategory);
      if (selectedTag) params.set("tag", selectedTag);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetching(false);
    }
  };

  // Extract all unique tags for the filter 
  const allUniqueTags = Array.from(new Set(products.flatMap(p => p.tags || []))).sort();

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 md:p-12 mb-20 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-800 pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent">
              Catalog Management
            </h1>
            <p className="text-gray-400 text-lg">Manage, filter, and modify your product inventory.</p>
          </div>
          <Link href="/admin/products/create">
            <button className="group flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/30 active:scale-95">
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              Add New Product
            </button>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gray-900/40 p-6 rounded-[2.5rem] border border-gray-800/80 backdrop-blur-xl">
          
          {/* Search Input */}
          <div className="lg:col-span-5 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all font-medium"
            />
          </div>

          {/* Category Dropdown */}
          <div className="lg:col-span-3 relative group">
            <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none group-focus-within:text-purple-400 transition-colors" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all font-semibold"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tag Select */}
          <div className="lg:col-span-3 relative group">
            <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors" />
            <select 
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-semibold"
            >
              <option value="">All Tags</option>
              {allUniqueTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

           {/* Clear Filter Button */}
          <div className="lg:col-span-1 flex items-center justify-center">
            <button 
              onClick={() => { setSearchTerm(""); setSelectedCategory(""); setSelectedTag(""); }}
              className="p-4 bg-gray-800/50 hover:bg-red-500/10 hover:text-red-400 text-gray-400 rounded-2xl border border-gray-800 transition-all active:scale-90"
              title="Clear all filters"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <span className="text-gray-500 font-medium animate-pulse">Filtering products...</span>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
            {products.map((product) => {
              const minPrice = Math.min(...product.variants.map(v => v.price));
              const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
              const mainImage = product.variants[0]?.imageUrl || "";

              return (
                <Link key={product.id} href={`/admin/products/${product.id}`} className="group relative bg-[#121215] border border-gray-800 rounded-[2.5rem] overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all cursor-pointer">
                  
                  {/* Thumbnail */}
                  <div className="aspect-[4/5] relative overflow-hidden bg-gray-900">
                    {mainImage ? (
                      <img src={mainImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                    
                    {/* Floating Category Badge */}
                    {product.category && (
                      <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-xs font-bold text-white border border-white/10">
                        <LayoutGrid className="w-3 h-3 text-purple-400" />
                        {product.category.name}
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors truncate">{product.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xl font-black text-white flex items-center">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          {minPrice.toFixed(2)}
                        </span>
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[0.65rem] font-black uppercase ${totalStock > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          <Package className="w-3 h-3" />
                          {totalStock} in stock
                        </div>
                      </div>
                    </div>

                    {/* Tags Chips */}
                    <div className="flex flex-wrap gap-1.5 min-h-[1.5rem]">
                      {product.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[0.6rem] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 px-2 py-1 rounded-md">
                          {tag}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="text-[0.6rem] font-bold text-gray-600 px-1 py-1">+ {product.tags.length - 3}</span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-800/50 flex items-center justify-between">
                      <span className="text-[0.65rem] text-gray-600 font-medium">Modified {new Date(product.createdAt).toLocaleDateString()}</span>
                      <ArrowRight className="w-4 h-4 text-gray-700 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center space-y-4">
            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center">
              <Frown className="w-12 h-12 text-gray-700" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold">No products found</h2>
              <p className="text-gray-500">Try adjusting your filters or add a new product.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
