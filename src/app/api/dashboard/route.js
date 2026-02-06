import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Total products count
    const totalProducts = await prisma.product.count();

    // Total stock quantity
    const stockSum = await prisma.product.aggregate({
      _sum: {
        stock: true,
      },
    });

    // Total inventory value
    const valueSum = await prisma.product.aggregate({
      _sum: {
        price: true,
      },
    });

    // Low stock products (less than 5)
    const lowStock = await prisma.product.count({
      where: {
        stock: {
          lt: 5,
        },
      },
    });

    return NextResponse.json({
      totalProducts,
      totalStock: stockSum._sum.stock || 0,
      totalValue: valueSum._sum.price || 0,
      lowStock,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
