import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch all products
export async function GET(req) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" }, // optional: order by ID
    });
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

// POST - Add a new product
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, stock, price } = body;

    if (!name || !stock || !price) {
      return new Response(JSON.stringify({ message: "All fields are required" }), { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        stock: parseInt(stock),
        price: parseFloat(price),
      },
    });

    return new Response(JSON.stringify(product), { status: 201 });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

// PUT - Update an existing product
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, name, stock, price } = body;

    if (!id || !name || !stock || !price) {
      return new Response(JSON.stringify({ message: "All fields are required" }), { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        stock: parseInt(stock),
        price: parseFloat(price),
      },
    });

    return new Response(JSON.stringify(updatedProduct), { status: 200 });
  } catch (err) {
    console.error("PUT /api/products error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

// DELETE - Remove a product
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ message: "Product ID is required" }), { status: 400 });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    return new Response(JSON.stringify({ message: "Product deleted" }), { status: 200 });
  } catch (err) {
    console.error("DELETE /api/products error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
