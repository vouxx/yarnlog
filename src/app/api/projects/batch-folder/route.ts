import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 폴더 이름 변경 또는 삭제 (해당 폴더의 모든 프로젝트 일괄 업데이트)
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { oldFolder, newFolder } = body;

  // newFolder가 null이면 미분류로 이동, string이면 이름 변경
  await prisma.project.updateMany({
    where: { folder: oldFolder || null },
    data: { folder: newFolder ?? null },
  });

  return NextResponse.json({ success: true });
}
