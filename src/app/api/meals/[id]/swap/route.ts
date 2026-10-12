import { NextResponse } from "next/server";
import { getMockSwapOptions, swapMockMeal } from "@/lib/mock/planner";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const options = getMockSwapOptions(id);
    return NextResponse.json(options);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch swap options" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { recipeId } = body;
    if (!recipeId) {
      return NextResponse.json({ error: "Missing recipeId" }, { status: 400 });
    }
    const updatedMeal = swapMockMeal(id, recipeId);
    return NextResponse.json(updatedMeal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to swap meal" }, { status: 400 });
  }
}
