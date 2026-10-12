import { NextResponse } from "next/server";
import { mockAuthService } from "@/lib/mock/auth";
import { seedMockProfileUser } from "@/lib/mock/profile";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const user = await mockAuthService.registerUser(email, password, name);
    const token = await mockAuthService.createToken(user);

    // Seed profile store with the registered user's real name & email
    seedMockProfileUser(user.name, user.email);

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 2,
      path: "/",
    });

    return NextResponse.json({ user, message: "Registered successfully" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
