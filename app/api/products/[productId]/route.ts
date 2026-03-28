import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// --- Fetch Single Product ---
export async function GET(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
        category: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error fetching single product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// --- Update Product ---
export async function PATCH(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { userId }: any = await auth();
    if (!userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;
    const { title, description, variants, categoryId, tags } = await req.json();

    if (!title || !description || !variants || !Array.isArray(variants)) {
      return NextResponse.json({ error: "Required fields missing: title, description, or variants." }, { status: 400 });
    }

    // Atomic Update using Transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
       // 1. Update Basic Info and Category/Tags
       const p = await tx.product.update({
          where: { id: productId },
          data: {
            title,
            description,
            categoryId: categoryId || null,
            tags: Array.isArray(tags) ? tags : [],
          }
       });

       // 2. Clear old variants and create new ones (Simplest way to maintain consistency)
       await tx.variant.deleteMany({
          where: { productId }
       });

       await tx.variant.createMany({
          data: variants.map((v: any) => ({
             productId,
             color: v.color,
             size: v.size,
             price: Number(v.price),
             stock: Number(v.stock),
             imageUrl: v.imageUrl,
          }))
       });

       return p;
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

// --- Delete Product ---
export async function DELETE(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { userId }: any = await auth();
    if (!userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;

    await prisma.$transaction(async (tx) => {
      // 1. Delete all variants linked to this product first
      await tx.variant.deleteMany({
        where: { productId }
      });

      // 2. Delete the product itself
      await tx.product.delete({
        where: { id: productId }
      });
    });

    return NextResponse.json({ success: true, message: "Product and its variants deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}

