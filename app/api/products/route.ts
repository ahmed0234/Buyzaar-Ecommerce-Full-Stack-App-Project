import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId }: any = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, variants, categoryId, tags } = await req.json();

    if (!title || !description || !variants || !Array.isArray(variants)) {
      return NextResponse.json(
        { error: "Invalid payload: title, description, and variants array are required" },
        { status: 400 }
      );
    }

    // Wrap in a transaction to ensure all or nothing creation
    const product = await prisma.product.create({
      data: {
        title,
        description,
        categoryId: categoryId || undefined,
        tags: Array.isArray(tags) ? tags : [],
        variants: {
          create: variants.map((v: any) => ({
            color: v.color,
            size: v.size,
            price: Number(v.price),
            stock: Number(v.stock),
            imageUrl: v.imageUrl,
          })),
        },
      },
      include: {
        variants: true,
      },
    });

    console.log("Successfully created product with variants:", product.id);

    return NextResponse.json(
      { success: true, product },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tag) {
      where.tags = {
        has: tag
      };
    }

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive"
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: true,
        category: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

