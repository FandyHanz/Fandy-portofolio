import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 1. CREATE PROJECT
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;

    if (session !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ success: false, message: "Unauthorized! Silakan login dulu." }, { status: 401 });
    }

    const { title, description, tags, links } = await req.json();

    const [result]: any = await db.query(
      "INSERT INTO projects (title, description, tags) VALUES (?, ?, ?)",
      [title, description, tags]
    );

    const projectId = result.insertId;

    if (links && Array.isArray(links)) {
      for (const link of links) {
        if (link.label && link.url) {
          await db.query(
            "INSERT INTO project_links (project_id, label, url) VALUES (?, ?, ?)",
            [projectId, link.label, link.url]
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: "Project berhasil disimpan!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. DELETE PROJECT
export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;

    if (session !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ success: false, message: "Unauthorized!" }, { status: 401 });
    }

    const { id } = await req.json();
    await db.query("DELETE FROM projects WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Project berhasil dihapus!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}