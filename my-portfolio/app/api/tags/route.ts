import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 1. GET ALL UNIQUE TAGS
export async function GET() {
  try {
    const [rows]: any = await db.query("SELECT tags FROM projects");
    
    const tagSet = new Set<string>();
    rows.forEach((row: any) => {
      if (row.tags) {
        row.tags.split(",").forEach((t: string) => {
          const trimmed = t.trim();
          if (trimmed) tagSet.add(trimmed);
        });
      }
    });

    const uniqueTags = Array.from(tagSet).sort();
    return NextResponse.json({ success: true, tags: uniqueTags });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. DELETE TAG DARI DATABASE & SEMUA PROJECT
export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;

    if (session !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ success: false, message: "Unauthorized!" }, { status: 401 });
    }

    const { tag } = await req.json();
    if (!tag) {
      return NextResponse.json({ success: false, message: "Tag wajib diisi!" }, { status: 400 });
    }

    // Ambil semua project yang mengandung tag ini
    const [projects]: any = await db.query("SELECT id, tags FROM projects WHERE tags LIKE ?", [`%${tag}%`]);

    for (const proj of projects) {
      if (proj.tags) {
        // Filter dan hapus tag spesifik tersebut
        const updatedTags = proj.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter((t: string) => t.toLowerCase() !== tag.toLowerCase())
          .join(", ");

        await db.query("UPDATE projects SET tags = ? WHERE id = ?", [updatedTags, proj.id]);
      }
    }

    return NextResponse.json({ success: true, message: `Tag '${tag}' berhasil dihapus!` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}