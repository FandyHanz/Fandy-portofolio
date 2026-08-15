"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const DarkSwal = Swal.mixin({
  background: "#2d3748",
  color: "#e2e8f0",
  confirmButtonColor: "#3182ce",
  cancelButtonColor: "#e53e3e",
});

interface AdminNavbarModalsProps {
  isAdmin: boolean;
  profileData: {
    name: string;
    role_title: string;
    bio: string;
    email: string;
    github_url: string;
    linkedin_url: string;
    profile_img: string;
    cv_file: string;
  };
}

export default function AdminNavbarModals({ isAdmin, profileData }: AdminNavbarModalsProps) {
  const router = useRouter();

  // Auth State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Profile State
  const [profName, setProfName] = useState(profileData?.name || "");
  const [profRole, setProfRole] = useState(profileData?.role_title || "");
  const [profBio, setProfBio] = useState(profileData?.bio || "");
  const [profEmail, setProfEmail] = useState(profileData?.email || "");
  const [profGithub, setProfGithub] = useState(profileData?.github_url || "");
  const [profLinkedin, setProfLinkedin] = useState(profileData?.linkedin_url || "");
  const [profImgFile, setProfImgFile] = useState<File | null>(null);
  const [profCvFile, setProfCvFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string>(profileData?.profile_img || "/profile.jpg");
  const [profLoading, setProfLoading] = useState(false);

  // Sinkronisasi data saat profileData dari server berubah
  useEffect(() => {
    if (profileData) {
      setProfName(profileData.name || "");
      setProfRole(profileData.role_title || "");
      setProfBio(profileData.bio || "");
      setProfEmail(profileData.email || "");
      setProfGithub(profileData.github_url || "");
      setProfLinkedin(profileData.linkedin_url || "");
      setPreviewImg(profileData.profile_img || "/profile.jpg");
    }
  }, [profileData]);

  // Project State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [links, setLinks] = useState<{ label: string; url: string }[]>([
    { label: "View Project", url: "" },
  ]);
  const [projLoading, setProjLoading] = useState(false);

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      if (data.success) setAvailableTags(data.tags);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const toggleSelectTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddNewTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newTagInput.trim();
    if (!clean) return;
    if (!availableTags.includes(clean)) setAvailableTags([...availableTags, clean]);
    if (!selectedTags.includes(clean)) setSelectedTags([...selectedTags, clean]);
    setNewTagInput("");
  };

  const removeSelectedTag = (t: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== t));
  };

  const handleDeleteGlobalTag = async (e: React.MouseEvent, tagToDelete: string) => {
    e.stopPropagation();
    const result = await DarkSwal.fire({
      title: "Hapus Tag?",
      text: `Tag '${tagToDelete}' akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const res = await fetch("/api/tags", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: tagToDelete }),
      });
      const data = await res.json();
      if (data.success) {
        setAvailableTags(availableTags.filter((t) => t !== tagToDelete));
        setSelectedTags(selectedTags.filter((t) => t !== tagToDelete));
        DarkSwal.fire({ icon: "success", title: "Terhapus", timer: 1200, showConfirmButton: false });
        router.refresh();
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        const modalEl = document.getElementById("loginModal");
        if (modalEl) (window as any).bootstrap?.Modal.getInstance(modalEl)?.hide();
        setUsername("");
        setPassword("");
        DarkSwal.fire({ icon: "success", title: "Login Berhasil", timer: 1500, showConfirmButton: false });
        router.refresh();
      } else {
        DarkSwal.fire({ icon: "error", title: "Gagal", text: data.message });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await DarkSwal.fire({
      title: "Logout?",
      text: "Keluar dari sesi admin?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      await fetch("/api/auth", { method: "DELETE" });
      DarkSwal.fire({ icon: "success", title: "Logged Out", timer: 1200, showConfirmButton: false });
      router.refresh();
    }
  };

  // Profile Submit Handler
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", profName);
      fd.append("role_title", profRole);
      fd.append("bio", profBio);
      fd.append("email", profEmail);
      fd.append("github_url", profGithub);
      fd.append("linkedin_url", profLinkedin);
      if (profImgFile) fd.append("profile_img_file", profImgFile);
      if (profCvFile) fd.append("cv_file_obj", profCvFile);

      const res = await fetch("/api/profile", {
        method: "PUT",
        body: fd,
      });
      const data = await res.json();

      if (data.success) {
        const modalEl = document.getElementById("editProfileModal");
        if (modalEl) (window as any).bootstrap?.Modal.getInstance(modalEl)?.hide();
        DarkSwal.fire({ icon: "success", title: "Profile Diperbarui!", timer: 1500, showConfirmButton: false });
        router.refresh();
      } else {
        DarkSwal.fire({ icon: "error", title: "Gagal Update", text: data.error || data.message });
      }
    } catch {
      DarkSwal.fire({ icon: "error", title: "Error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setProfLoading(false);
    }
  };

  const handleAddLink = () => setLinks([...links, { label: "View website deployment", url: "" }]);
  const handleLinkChange = (idx: number, field: "label" | "url", val: string) => {
    const arr = [...links];
    arr[idx][field] = val;
    setLinks(arr);
  };
  const handleRemoveLink = (idx: number) => setLinks(links.filter((_, i) => i !== idx));

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, tags: selectedTags.join(", "), links }),
      });
      const data = await res.json();
      if (data.success) {
        const modalEl = document.getElementById("adminProjectModal");
        if (modalEl) (window as any).bootstrap?.Modal.getInstance(modalEl)?.hide();
        setTitle("");
        setDescription("");
        setSelectedTags([]);
        setLinks([{ label: "View Project", url: "" }]);
        DarkSwal.fire({ icon: "success", title: "Berhasil disimpan!", timer: 1500, showConfirmButton: false });
        fetchTags();
        router.refresh();
      } else {
        DarkSwal.fire({ icon: "error", title: "Gagal", text: data.message });
      }
    } finally {
      setProjLoading(false);
    }
  };

  return (
    <>
      {/* BAR ATAS */}
      <div className="d-flex justify-content-end gap-2 mb-2">
        {isAdmin ? (
          <>
            <button
              type="button"
              className="btn btn-outline-warning btn-sm rounded-pill px-3"
              data-bs-toggle="modal"
              data-bs-target="#editProfileModal"
            >
              <i className="fas fa-user-edit me-1"></i> Edit About
            </button>
            <button
              type="button"
              className="btn btn-outline-success btn-sm rounded-pill px-3"
              data-bs-toggle="modal"
              data-bs-target="#adminProjectModal"
            >
              <i className="fas fa-plus me-1"></i> Tambah Project
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm rounded-pill px-3"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt me-1"></i> Logout
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
            data-bs-toggle="modal"
            data-bs-target="#loginModal"
          >
            <i className="fas fa-lock me-1"></i> Login Admin
          </button>
        )}
      </div>

      {/* MODAL 1: LOGIN */}
      <div className="modal fade" id="loginModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content bg-dark text-white border-secondary rounded-4">
            <div className="modal-header border-secondary">
              <h5 className="modal-title fw-bold">Login Administrator</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form onSubmit={handleLogin}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control bg-secondary text-white border-dark rounded-3"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control bg-secondary text-white border-dark rounded-3"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button type="submit" className="btn btn-primary w-100 rounded-pill" disabled={authLoading}>
                  {authLoading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL 2: EDIT PROFILE / ABOUT ME (FOOTER STATIC DI BAWAH) */}
      <div className="modal fade" id="editProfileModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div
            className="modal-content bg-dark text-white border-secondary rounded-4 d-flex flex-column"
            style={{ maxHeight: "85vh" }}
          >
            {/* HEADER FIXED */}
            <div className="modal-header border-secondary flex-shrink-0">
              <h5 className="modal-title fw-bold">Edit Profile & About Me</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            {/* FORM BODY SCROLLABLE */}
            <form onSubmit={handleProfileSubmit} className="d-flex flex-column flex-grow-1 overflow-hidden">
              <div className="modal-body overflow-y-auto px-4 py-3 flex-grow-1">
                {/* PREVIEW FOTO PROFIL */}
                <div className="text-center mb-3">
                  <img
                    src={previewImg}
                    alt="Preview"
                    className="img-fluid rounded-circle border border-2 border-secondary"
                    style={{ width: "110px", height: "110px", objectFit: "cover" }}
                  />
                  <div className="small text-white-50 mt-1">Foto Profil Aktif</div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nama Lengkap</label>
                    <input
                      type="text"
                      className="form-control bg-secondary text-white border-dark rounded-3"
                      required
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Role / Title</label>
                    <input
                      type="text"
                      className="form-control bg-secondary text-white border-dark rounded-3"
                      required
                      value={profRole}
                      onChange={(e) => setProfRole(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Bio Singkat</label>
                  <textarea
                    rows={3}
                    className="form-control bg-secondary text-white border-dark rounded-3"
                    required
                    value={profBio}
                    onChange={(e) => setProfBio(e.target.value)}
                  />
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control bg-secondary text-white border-dark rounded-3"
                      required
                      value={profEmail}
                      onChange={(e) => setProfEmail(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">GitHub URL</label>
                    <input
                      type="url"
                      className="form-control bg-secondary text-white border-dark rounded-3"
                      required
                      value={profGithub}
                      onChange={(e) => setProfGithub(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">LinkedIn URL</label>
                    <input
                      type="url"
                      className="form-control bg-secondary text-white border-dark rounded-3"
                      required
                      value={profLinkedin}
                      onChange={(e) => setProfLinkedin(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Ganti Foto Profil (Opsional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control bg-secondary text-white border-dark rounded-3"
                      onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        setProfImgFile(file);
                        if (file) setPreviewImg(URL.createObjectURL(file));
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Ganti File CV (Opsional)</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="form-control bg-secondary text-white border-dark rounded-3"
                      onChange={(e) => setProfCvFile(e.target.files ? e.target.files[0] : null)}
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER STATIC SELALU KELIHATAN DI BAWAH */}
              <div className="modal-footer border-secondary flex-shrink-0 bg-dark">
                <button type="button" className="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">
                  Batal
                </button>
                <button type="submit" className="btn btn-warning rounded-pill px-4" disabled={profLoading}>
                  {profLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL 3: TAMBAH PROJECT */}
      <div className="modal fade" id="adminProjectModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div
            className="modal-content bg-dark text-white border-secondary rounded-4 d-flex flex-column"
            style={{ maxHeight: "85vh" }}
          >
            {/* HEADER FIXED */}
            <div className="modal-header border-secondary flex-shrink-0">
              <h5 className="modal-title fw-bold">Tambah Data Project</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            {/* FORM BODY SCROLLABLE */}
            <form onSubmit={handleProjectSubmit} className="d-flex flex-column flex-grow-1 overflow-hidden">
              <div className="modal-body overflow-y-auto px-4 py-3 flex-grow-1">
                <div className="mb-3">
                  <label className="form-label">Judul Project</label>
                  <input
                    type="text"
                    placeholder="Contoh: Sistem Pencatatan Prestasi Mahasiswa"
                    className="form-control bg-secondary text-white border-dark rounded-3"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Deskripsi</label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan deskripsi lengkap project..."
                    className="form-control bg-secondary text-white border-dark rounded-3"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Tags / Teknologi</label>
                  <div className="p-2 border border-secondary rounded-3 bg-dark mb-2 d-flex flex-wrap gap-1 align-items-center">
                    {selectedTags.length === 0 ? (
                      <span className="text-white-50 small ps-1">Belum ada tag dipilih</span>
                    ) : (
                      selectedTags.map((tag) => (
                        <span key={tag} className="badge bg-primary rounded-pill d-flex align-items-center gap-2 px-3 py-2 fs-6">
                          {tag}
                          <button
                            type="button"
                            className="btn-close btn-close-white"
                            style={{ width: "0.45em", height: "0.45em" }}
                            onClick={() => removeSelectedTag(tag)}
                          ></button>
                        </span>
                      ))
                    )}
                  </div>

                  <div className="input-group input-group-sm mb-2">
                    <input
                      type="text"
                      className="form-control bg-secondary text-white border-dark rounded-start-pill ps-3"
                      placeholder="Ketik tag baru..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddNewTag();
                        }
                      }}
                    />
                    <button type="button" className="btn btn-outline-info rounded-end-pill px-3" onClick={() => handleAddNewTag()}>
                      + Tambah Tag
                    </button>
                  </div>

                  <div className="d-flex flex-wrap gap-2 pt-1">
                    {availableTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <div
                          key={tag}
                          onClick={() => toggleSelectTag(tag)}
                          className={`badge rounded-pill d-inline-flex align-items-center gap-2 px-3 py-2 ${isSelected ? "bg-success" : "badge-custom opacity-75"
                            }`}
                          style={{ cursor: "pointer", fontSize: "0.85em" }}
                        >
                          <span>{isSelected ? `✓ ${tag}` : `+ ${tag}`}</span>
                          <span
                            onClick={(e) => handleDeleteGlobalTag(e, tag)}
                            className="text-white-50 fw-bold ps-1"
                          >
                            &times;
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label d-block">Hyperlinks (Multiple)</label>
                  {links.map((item, idx) => (
                    <div key={idx} className="d-flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Label"
                        className="form-control bg-secondary text-white border-dark rounded-3"
                        value={item.label}
                        onChange={(e) => handleLinkChange(idx, "label", e.target.value)}
                        required
                      />
                      <input
                        type="url"
                        placeholder="URL"
                        className="form-control bg-secondary text-white border-dark rounded-3"
                        value={item.url}
                        onChange={(e) => handleLinkChange(idx, "url", e.target.value)}
                        required
                      />
                      {links.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "38px", height: "38px" }}
                          onClick={() => handleRemoveLink(idx)}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-outline-info rounded-pill px-3 mt-1" onClick={handleAddLink}>
                    + Tambah Link Lain
                  </button>
                </div>
              </div>

              {/* FOOTER STATIC SELALU KELIHATAN DI BAWAH */}
              <div className="modal-footer border-secondary flex-shrink-0 bg-dark">
                <button type="button" className="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">
                  Tutup
                </button>
                <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={projLoading}>
                  {projLoading ? "Menyimpan..." : "Simpan Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}