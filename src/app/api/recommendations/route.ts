import { NextResponse } from "next/server";
import { getMockRecommendationsData } from "@/lib/mock/recipes";

export async function GET() {
  try {
    const data = getMockRecommendationsData();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch recommendations" }, { status: 500 });
  }
}
