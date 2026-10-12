import { NextResponse } from "next/server";
import { mockAuthService } from "@/lib/mock/auth";
import { seedMockProfileUser } from "@/lib/mock/profile";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const user = await mockAuthService.verifyCredentials(email, password);
    const token = await mockAuthService.createToken(user);

    // Seed profile store with the authenticated user's email (name derived from email prefix)
    seedMockProfileUser(user.email.split("@")[0], user.email);

    // Set HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });

    return NextResponse.json({ user, message: "Logged in successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}
