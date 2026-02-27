import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  const fields = ["type", "name", "brand", "color", "weight", "quantity", "notes", "imageUrl", "folder"];

  for (const field of fields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  const material = await prisma.material.update({
    where: { id },
    data,
  });

  return NextResponse.json(material);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.material.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
