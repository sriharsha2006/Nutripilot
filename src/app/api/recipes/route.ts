import { NextResponse } from "next/server";
import { getMockRecipesCatalog, addMockCustomRecipe } from "@/lib/mock/recipes";

export async function GET() {
  try {
    const catalog = getMockRecipesCatalog();
    return NextResponse.json(catalog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRecipe = addMockCustomRecipe(body);
    return NextResponse.json(newRecipe);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create custom recipe" }, { status: 400 });
  }
}
