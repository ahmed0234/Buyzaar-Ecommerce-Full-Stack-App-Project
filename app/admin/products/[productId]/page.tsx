"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { Loader2, ArrowLeft, Frown } from "lucide-react";
import Link from "next/link";

export default function AdminProductEditPage() {
  const { productId } = useParams();
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!productId) return;

    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProductData(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setError(true);
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <span className="text-gray-500 font-medium tracking-widest uppercase text-xs">Fetching Product Data...</span>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
            <Frown className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-1">
            <h1 className="text-2xl font-bold">Product not found</h1>
            <p className="text-gray-400">The product you are trying to edit does not exist or has been deleted.</p>
        </div>
        <Link href="/admin/products" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium underline underline-offset-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return <ProductForm initialData={productData} mode="edit" />;
}
