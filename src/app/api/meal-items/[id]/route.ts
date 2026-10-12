import { NextResponse } from "next/server";
import { updateMockMealItem } from "@/lib/mock/planner";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedMeal = updateMockMealItem(id, body);
    return NextResponse.json(updatedMeal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update meal item" }, { status: 400 });
  }
}
