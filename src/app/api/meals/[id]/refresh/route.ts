import { NextResponse } from "next/server";
import { refreshMockMeal } from "@/lib/mock/planner";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedMeal = refreshMockMeal(id);
    return NextResponse.json(updatedMeal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to refresh meal" }, { status: 400 });
  }
}
