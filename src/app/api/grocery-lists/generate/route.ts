import { NextResponse } from "next/server";
import {
  generateMockGroceryList,
  updateMockGroceryItem,
  addMockCustomGroceryItem,
} from "@/lib/mock/pantry";

export async function GET() {
  try {
    const list = generateMockGroceryList();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate grocery list" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = addMockCustomGroceryItem(body);
    return NextResponse.json(newItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add custom grocery item" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { itemId, isChecked } = body;
    if (!itemId) return NextResponse.json({ error: "Missing itemId" }, { status: 400 });

    const updated = updateMockGroceryItem(itemId, isChecked);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update grocery item" }, { status: 400 });
  }
}
