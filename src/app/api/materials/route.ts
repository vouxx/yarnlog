import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const materials = await prisma.material.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(materials);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const material = await prisma.material.create({
    data: {
      type: body.type || "yarn",
      name: body.name,
      brand: body.brand || null,
      color: body.color || null,
      weight: body.weight || null,
      quantity: body.quantity || null,
      notes: body.notes || null,
      imageUrl: body.imageUrl || null,
    },
  });

  return NextResponse.json(material, { status: 201 });
}
