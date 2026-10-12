import { NextResponse } from "next/server";
import {
  getMockPantryItems,
  addMockPantryItem,
  updateMockPantryItem,
  deleteMockPantryItem,
} from "@/lib/mock/pantry";

export async function GET() {
  try {
    const items = getMockPantryItems();
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch pantry items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = addMockPantryItem(body);
    return NextResponse.json(newItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add pantry item" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing item ID" }, { status: 400 });

    const updates = await request.json();
    const updated = updateMockPantryItem(id, updates);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update pantry item" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing item ID" }, { status: 400 });

    const success = deleteMockPantryItem(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete pantry item" }, { status: 400 });
  }
}
