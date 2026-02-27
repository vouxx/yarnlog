import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  const fields = [
    "title",
    "memo",
    "gauge",
    "yarns",
    "needles",
    "supplies",
    "attachments",
    "progress",
    "difficulty",
    "tags",
    "folder",
    "counters",
    "status",
    "position",
  ];

  for (const field of fields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  if (body.startDate !== undefined) {
    data.startDate = body.startDate ? new Date(body.startDate) : null;
  }
  if (body.endDate !== undefined) {
    data.endDate = body.endDate ? new Date(body.endDate) : null;
  }

  const project = await prisma.project.update({
    where: { id },
    data,
  });

  return NextResponse.json(project);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
