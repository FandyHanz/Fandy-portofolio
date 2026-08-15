import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// 1. GET CURRENT PROFILE DATA
export async function GET() {
  try {
    const [rows]: any = await db.query("SELECT * FROM profile WHERE id = 1 LIMIT 1");
    if (rows.length === 0) {
      // Default Fallback jika tabel kosong
      return NextResponse.json({
        success: true,
        data: {
          name: "Fandy Wahyu Hanzura",
          role_title: "Junior Full Stack Developer",
          bio: "Im an Junior Full Stack developer and Data scientist enthusiast now currently studying in State Polytechnic of Malang in Computer Science and computer engginering field",
          email: "hanzyura28@gmail.com",
          github_url: "https://github.com/FandyHanz",
          linkedin_url: "https://www.linkedin.com/in/fandy-wahyu-hanzura-0b4171369/",
          profile_img: "/profile.jpg",
          cv_file: "/cv.jpg",
        },
      });
    }
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. UPDATE PROFILE (NO CREATE, STRICT UPDATE)
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;

    if (session !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ success: false, message: "Unauthorized!" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = (formData.get("name") as string) || "";
    const role_title = (formData.get("role_title") as string) || "";
    const bio = (formData.get("bio") as string) || "";
    const email = (formData.get("email") as string) || "";
    const github_url = (formData.get("github_url") as string) || "";
    const linkedin_url = (formData.get("linkedin_url") as string) || "";

    const profileImgFile = formData.get("profile_img_file");
    const cvFileObj = formData.get("cv_file_obj");

    // Ambil data profile saat ini
    const [rows]: any = await db.query("SELECT * FROM profile WHERE id = 1 LIMIT 1");
    let currentProfileImg = rows[0]?.profile_img || "/profile.jpg";
    let currentCvFile = rows[0]?.cv_file || "/cv.jpg";

    // Pastikan folder /public/uploads/ ada
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    // Handle upload Foto Profil Baru jika user memilih file
    if (profileImgFile && typeof profileImgFile === "object" && "arrayBuffer" in profileImgFile && (profileImgFile as File).size > 0) {
      const file = profileImgFile as File;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(file.name) || ".jpg";
      const fileName = `profile_${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      currentProfileImg = `/uploads/${fileName}`;
    }

    // Handle upload CV Baru jika user memilih file
    if (cvFileObj && typeof cvFileObj === "object" && "arrayBuffer" in cvFileObj && (cvFileObj as File).size > 0) {
      const file = cvFileObj as File;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(file.name) || ".jpg";
      const fileName = `cv_${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      currentCvFile = `/uploads/${fileName}`;
    }

    // Eksekusi Update ke MySQL
    await db.query(
      `INSERT INTO profile (id, name, role_title, bio, email, github_url, linkedin_url, profile_img, cv_file)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name),
         role_title = VALUES(role_title),
         bio = VALUES(bio),
         email = VALUES(email),
         github_url = VALUES(github_url),
         linkedin_url = VALUES(linkedin_url),
         profile_img = VALUES(profile_img),
         cv_file = VALUES(cv_file)`,
      [name, role_title, bio, email, github_url, linkedin_url, currentProfileImg, currentCvFile]
    );

    return NextResponse.json({ success: true, message: "Profile berhasil diperbarui!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}