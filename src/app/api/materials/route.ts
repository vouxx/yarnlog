import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const materials = await prisma.material.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(materials);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const ids: string[] = body.ids;

  if (!ids || ids.length === 0) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }

  await prisma.material.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json({ success: true, deleted: ids.length });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { ids, folder } = body;

  if (!ids || ids.length === 0) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }

  await prisma.material.updateMany({
    where: { id: { in: ids } },
    data: { folder: folder || null },
  });

  return NextResponse.json({ success: true, updated: ids.length });
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
      folder: body.folder || null,
    },
  });

  return NextResponse.json(material, { status: 201 });
}
