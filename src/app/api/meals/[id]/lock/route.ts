import { NextResponse } from "next/server";
import { toggleMockMealLock } from "@/lib/mock/planner";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = toggleMockMealLock(id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to toggle meal lock" }, { status: 400 });
  }
}
