import { NextResponse } from "next/server";
import { getMockWeeklyPlan, generateMockWeeklyPlan } from "@/lib/mock/planner";

export async function GET() {
  try {
    const plan = getMockWeeklyPlan();
    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch meal plan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { forceRegenerateAll = false } = body;
    const plan = generateMockWeeklyPlan(forceRegenerateAll);
    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate meal plan" }, { status: 500 });
  }
}
