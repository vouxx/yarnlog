import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const maxPosition = await prisma.project.aggregate({
    where: { status: body.status || "todo" },
    _max: { position: true },
  });

  const project = await prisma.project.create({
    data: {
      title: body.title,
      memo: body.memo || null,
      yarnType: body.yarnType || null,
      needleSize: body.needleSize || null,
      gauge: body.gauge || null,
      patternUrl: body.patternUrl || null,
      imageUrl: body.imageUrl || null,
      progress: body.progress || 0,
      difficulty: body.difficulty || 1,
      tags: body.tags || [],
      status: body.status || "todo",
      position: (maxPosition._max.position ?? -1) + 1,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
