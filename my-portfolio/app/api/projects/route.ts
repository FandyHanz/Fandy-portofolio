import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

// POST: Tambah Project
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    if (!adminSession?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, tags, links } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title dan Description wajib diisi" }, { status: 400 });
    }

    const [result]: any = await db.query(
      "INSERT INTO projects (title, description, tags) VALUES (?, ?, ?)",
      [title, description, tags || ""]
    );

    const newProjectId = result.insertId;

    if (Array.isArray(links) && links.length > 0) {
      for (const link of links) {
        if (link.label && link.url) {
          await db.query(
            "INSERT INTO project_links (project_id, label, url) VALUES (?, ?, ?)",
            [newProjectId, link.label, link.url]
          );
        }
      }
    }

    return NextResponse.json({ message: "Project berhasil ditambahkan", id: newProjectId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update Project (Berdasarkan Query Params ?id=...)
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    if (!adminSession?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID project tidak ditemukan" }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, tags, links } = body;

    // 1. Update Tabel Projects
    await db.query(
      "UPDATE projects SET title = ?, description = ?, tags = ? WHERE id = ?",
      [title, description, tags || "", id]
    );

    // 2. Refresh Tabel project_links
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

// DELETE: Hapus Project
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    if (!adminSession?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID project tidak ditemukan" }, { status: 400 });
    }

    await db.query("DELETE FROM projects WHERE id = ?", [id]);

    return NextResponse.json({ message: "Project berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}