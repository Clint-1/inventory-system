import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lt: 5,
        },
      },
      orderBy: {
        stock: "asc",
      },
    });

    return NextResponse.json(lowStockProducts);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
