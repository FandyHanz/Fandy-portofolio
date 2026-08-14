import { db } from "@/lib/db";
import { cookies } from "next/headers";
import Script from "next/script";
import AdminNavbarModals from "./components/AdminNavbarModals";
import DeleteProjectBtn from "./components/DeleteProjectBtn";

export const revalidate = 0;

export default async function Home() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === process.env.ADMIN_SECRET_KEY;

  const [projects]: any = await db.query(
    "SELECT * FROM projects ORDER BY created_at DESC"
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
        <AdminNavbarModals isAdmin={isAdmin} />

        {/* HEADER SECTION */}
        <header className="text-center py-5">
          <img
            src="/profile.jpg"
            alt="Profile"
            className="img-fluid rounded-circle"
            style={{ width: "300px", height: "300px", objectFit: "cover" }}
          />
          <h1 className="display-4 fw-bold mt-3">Fandy Wahyu Hanzura</h1>
          <p className="lead text-white-50">Junior Full Stack Developer</p>
          <p className="mt-4 col-lg-8 mx-auto">
            Im an Junior Full Stack developer and Data scientist enthusiast now currently studying in State
            Polytechnic of Malang in Computer Science and computer engginering field
          </p>
          <div className="mt-4">
            <a href="mailto:hanzyura28@gmail.com" className="text-white-50 text-decoration-none me-3 fs-3">
              <i className="fas fa-envelope"></i>
            </a>
            <a href="https://github.com/FandyHanz" target="_blank" className="text-white-50 text-decoration-none me-3 fs-3">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://www.linkedin.com/in/fandy-wahyu-hanzura-0b4171369/" target="_blank" className="text-white-50 text-decoration-none fs-3">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
          <div className="mt-4">
            <p className="mt-4 col-lg-8 mx-auto">Wanna see my Curiculum Vitae</p>
            <div className="mt-3">
              <a href="/cv.jpg" target="_blank">
                <span className="badge badge-custom fs-5">Click Here !</span>
              </a>
            </div>
          </div>
        </header>

        <hr className="text-white-50 my-5" />

        {/* DIGITAL CLOCK */}
        <div className="container-fluid">
          <h1 className="h2 mb-4 fw-bold">Time:</h1>
          <div className="digital-clock-container">
            <span id="clock-hours">00</span>
            <span className="clock-separator">:</span>
            <span id="clock-minutes">00</span>
            <span className="clock-separator">:</span>
            <span id="clock-seconds">00</span>
          </div>
        </div>

        <hr className="text-white-50 my-5" />

        {/* PRAYER TIME */}
        <div className="container-fluid">
          <h1 className="h2 mb-4 fw-bold">Prayer Time:</h1>
          <div className="prayer-schedule-container">
            <div className="header">
              <div className="date-location">
                <span id="location">Malang</span>, <span id="current-date">--</span>
              </div>
            </div>
            <div className="prayer-times">
              <div className="prayer-time-item"><div className="prayer-name">Subuh</div><div className="time" id="fajr-time">--:--</div></div>
              <div className="prayer-time-item"><div className="prayer-name">Dzuhur</div><div className="time" id="dhuhr-time">--:--</div></div>
              <div className="prayer-time-item"><div className="prayer-name">Ashar</div><div className="time" id="asr-time">--:--</div></div>
              <div className="prayer-time-item"><div className="prayer-name">Maghrib</div><div className="time" id="maghrib-time">--:--</div></div>
              <div className="prayer-time-item"><div className="prayer-name">Isha</div><div className="time" id="isha-time">--:--</div></div>
            </div>
          </div>
          <br />
          <p>* Might not accurated just reminder</p>
        </div>

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
                    {/* TOMBOL DELETE JIKA ADMIN LOGIN */}
                    {isAdmin && <DeleteProjectBtn id={proj.id} />}

                    <div className="card-body">
                      <h5 className="card-title fw-bold">{proj.title}</h5>
                      <p className="card-text small text-white-50 mt-2">
                        {proj.description}
                      </p>
                      <div className="mt-3">
                        {tagsArray.map((tag: string, idx: number) => (
                          <span key={idx} className="badge badge-custom me-1 mb-1">
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
                          className="btn btn-outline-light btn-sm"
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
            &copy; 2026 Fandy Wahyu Hanzura. All Rights Reserved.
          </p>
        </header>
      </div>

      <Script id="clock-and-prayer" strategy="lazyOnload">{`
        function updateClock() {
            const now = new Date();
            let hours = now.getHours();
            let minutes = now.getMinutes();
            let seconds = now.getSeconds();
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            if (document.getElementById('clock-hours')) {
                document.getElementById('clock-hours').textContent = hours;
                document.getElementById('clock-minutes').textContent = minutes;
                document.getElementById('clock-seconds').textContent = seconds;
            }
        }
        setInterval(updateClock, 1000);
        updateClock();

        document.addEventListener('DOMContentLoaded', function () {
            if (typeof prayTimes !== 'undefined') {
                const latitude = -7.9839;
                const longitude = 112.6214;
                const timeZone = 7;
                prayTimes.setMethod('Kemenag');
                const today = new Date();
                const times = prayTimes.getTimes(today, [latitude, longitude], timeZone);
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                if (document.getElementById('current-date')) {
                    document.getElementById('current-date').textContent = today.toLocaleDateString('en-GB', options);
                    document.getElementById('fajr-time').textContent = times.fajr;
                    document.getElementById('dhuhr-time').textContent = times.dhuhr;
                    document.getElementById('asr-time').textContent = times.asr;
                    document.getElementById('maghrib-time').textContent = times.maghrib;
                    document.getElementById('isha-time').textContent = times.isha;
                }
            }
        });
      `}</Script>
    </main>
  );
}