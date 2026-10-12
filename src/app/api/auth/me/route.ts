import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mockAuthService } from "@/lib/mock/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await mockAuthService.verifyToken(token);
  
  if (!payload) {
    return NextResponse.json({ message: "Invalid session" }, { status: 401 });
  }

  return NextResponse.json({ 
    user: {
      id: payload.userId,
      email: payload.email,
      name: payload.name || (payload.email as string).split("@")[0],
    }
  });
}
