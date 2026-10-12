import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing recipient email" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Report ${id} successfully sent to ${email}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send email report" }, { status: 500 });
  }
}
