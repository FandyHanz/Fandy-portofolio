import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    if (!adminSession?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, tags, links } = body;

    // 1. Update Tabel Projects
    await db.query(
      "UPDATE projects SET title = ?, description = ?, tags = ? WHERE id = ?",
      [title, description, tags || "", id]
    );

    // 2. Refresh Link Terkait (Hapus lama, insert baru)
    await db.query("DELETE FROM project_links WHERE project_id = ?", [id]);

    if (Array.isArray(links) && links.length > 0) {
      for (const link of links) {
        if (link.label && link.url) {
          await db.query(
            "INSERT INTO project_links (project_id, label, url) VALUES (?, ?, ?)",
            [id, link.label, link.url]
          );
        }
      }
    }

    return NextResponse.json({ message: "Project berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}