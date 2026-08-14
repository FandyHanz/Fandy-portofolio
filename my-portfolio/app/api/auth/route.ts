import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// LOGIN
export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const [rows]: any = await db.query(
      "SELECT * FROM admins WHERE username = ? AND password = ? LIMIT 1",
      [username, password]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Username atau Password salah!" },
        { status: 401 }
      );
    }

    // Set Cookie Session
    const cookieStore = await cookies();
    cookieStore.set("admin_session", process.env.ADMIN_SECRET_KEY || "fandy_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return NextResponse.json({ success: true, message: "Login berhasil!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// LOGOUT
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true, message: "Logout berhasil!" });
}