import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    if (!adminSession?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      role_title,
      bio,
      email,
      github_url,
      linkedin_url,
      profile_img,
      cv_file,
    } = body;

    await db.query(
      `UPDATE profile SET 
        name = ?, 
        role_title = ?, 
        bio = ?, 
        email = ?, 
        github_url = ?, 
        linkedin_url = ?, 
        profile_img = ?, 
        cv_file = ?
      WHERE id = 1`,
      [
        name,
        role_title,
        bio,
        email,
        github_url,
        linkedin_url,
        profile_img || "/profile.jpg",
        cv_file || "/cv.jpg",
      ]
    );

    return NextResponse.json({ success: true, message: "Profile berhasil diperbarui!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}