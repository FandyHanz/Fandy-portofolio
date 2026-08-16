import { db } from "@/lib/db";
import { cookies } from "next/headers";
import AdminNavbarModals from "@/app/components/AdminNavbarModals";
import ProjectCardActions from "@/app/components/ProjectCardActions";
import PrayerAndClock from "@/app/components/PrayerAndClock";

export const revalidate = 0;

export default async function Home() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === process.env.ADMIN_SECRET_KEY;

  // 1. Tarik Data Profile
  const [profileRows]: any = await db.query("SELECT * FROM profile WHERE id = 1 LIMIT 1");
  const profile = {
    name: profileRows[0]?.name || "Fandy Wahyu Hanzura",
    role_title: profileRows[0]?.role_title || "Junior Full Stack Developer",
    bio: profileRows[0]?.bio || "Im an Junior Full Stack developer...",
    email: profileRows[0]?.email || "hanzyura28@gmail.com",
    github_url: profileRows[0]?.github_url || "https://github.com/FandyHanz",
    linkedin_url: profileRows[0]?.linkedin_url || "https://www.linkedin.com/in/fandy-wahyu-hanzura-0b4171369/",
    profile_img: profileRows[0]?.profile_img || "/profile.jpg",
    cv_file: profileRows[0]?.cv_file || "/cv.jpg",
  };
  // 2. Tarik Data Projects
  const [projects]: any = await db.query(
    "SELECT * FROM projects ORDER BY created_at ASC"
  );
  const [links]: any = await db.query("SELECT * FROM project_links");

  const projectsWithLinks = projects.map((p: any) => ({
    ...p,
    links: links.filter((l: any) => l.project_id === p.id),
  }));

  return (
    <main className="main-content">
      <div className="container">
        {/* NAV BUTTONS & MODALS */}
        <AdminNavbarModals isAdmin={isAdmin} profileData={profile} />

        {/* DYNAMIC HEADER / ABOUT SECTION */}
        <header className="text-center py-5">
          <img
            src={profile.profile_img}
            alt={profile.name}
            className="img-fluid rounded-circle"
            style={{ width: "300px", height: "300px", objectFit: "cover" }}
          />
          <h1 className="display-4 fw-bold mt-3">{profile.name}</h1>
          <p className="lead text-white-50">{profile.role_title}</p>
          <p className="mt-4 col-lg-8 mx-auto">{profile.bio}</p>
          <div className="mt-4">
            <a href={`mailto:${profile.email}`} className="text-white-50 text-decoration-none me-3 fs-3" title="Email">
              <i className="fas fa-envelope"></i>
            </a>
            <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-white-50 text-decoration-none me-3 fs-3" title="GitHub">
              <i className="fab fa-github"></i>
            </a>
            <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-white-50 text-decoration-none fs-3" title="LinkedIn">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
          <div className="mt-4">
            <p className="mt-4 col-lg-8 mx-auto">Wanna see my Curiculum Vitae</p>
            <div className="mt-3">
              <a href={profile.cv_file} target="_blank" rel="noreferrer">
                <span className="badge badge-custom fs-5 rounded-pill px-4 py-2">Click Here !</span>
              </a>
            </div>
          </div>
        </header>

        <hr className="text-white-50 my-5" />

        {/* JAM DIGITAL & JADWAL SHOLAT OTOMATIS */}
        <PrayerAndClock />

        <hr className="text-white-50 my-5" />

        {/* MY PROJECT SECTION */}
        <div className="container-fluid">
          <h1 className="h2 mb-4 fw-bold">My Project:</h1>
          <div className="row">
            {projectsWithLinks.map((proj: any) => {
              const tagsArray = proj.tags
                ? proj.tags.split(",").map((t: string) => t.trim())
                : [];

              return (
                <div key={proj.id} className="col-lg-4 col-md-6 mb-4">
                  <div className="card project-card text-white h-100 position-relative">
                    {/* Menu Titik Tiga (Edit & Hapus) */}
                    {isAdmin && <ProjectCardActions project={proj} />}

                    <div className="card-body">
                      {/* pe-5 biar judul gak tabrakan sama menu titik tiga */}
                      <h5 className="card-title fw-bold pe-5">{proj.title}</h5>
                      <p className="card-text small text-white-50 mt-2">
                        {proj.description}
                      </p>
                      <div className="mt-3">
                        {tagsArray.map((tag: string, idx: number) => (
                          <span key={idx} className="badge badge-custom me-1 mb-1 rounded-pill px-3 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="card-footer bg-transparent border-top border-secondary d-flex flex-wrap gap-2">
                      {proj.links.map((link: any) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-light btn-sm rounded-pill px-3"
                        >
                          {link.label} <i className="fas fa-arrow-right ms-1"></i>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <header className="text-center py-5">
          <p className="mt-4 col-lg-8 mx-auto">
            &copy; 2026 {profile.name}. All Rights Reserved.
          </p>
        </header>
      </div>
    </main>
  );
}