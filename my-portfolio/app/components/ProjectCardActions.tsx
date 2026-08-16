"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface ProjectLink {
  label: string;
  url: string;
}

interface ProjectData {
  id: number;
  title: string;
  description: string;
  tags: string;
  links: ProjectLink[];
}

export default function ProjectCardActions({ project }: { project: ProjectData }) {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // State Form Edit
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [tags, setTags] = useState(project.tags || "");
  const [links, setLinks] = useState<ProjectLink[]>(
    project.links && project.links.length > 0
      ? project.links
      : [{ label: "View Project", url: "" }]
  );

  const handleLinkChange = (index: number, field: "label" | "url", value: string) => {
    const updated = [...links];
    updated[index][field] = value;
    setLinks(updated);
  };

  const addLinkField = () => {
    setLinks([...links, { label: "View Project", url: "" }]);
  };

  const removeLinkField = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gunakan query params ?id=... (pasti mengarah ke /api/projects)
      const res = await fetch(`/api/projects?id=${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, tags, links }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowEditModal(false);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: data.message || "Project berhasil diperbarui.",
          background: "#212529",
          color: "#fff",
          confirmButtonColor: "#ffc107",
          timer: 1500,
          showConfirmButton: false,
        });
        router.refresh();
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Update",
          text: data.error || "Terjadi kesalahan",
          background: "#212529",
          color: "#fff",
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        background: "#212529",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Hapus Project?",
      text: "Data project ini beserta link-nya akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      background: "#2b3035",
      color: "#fff",
      customClass: {
        popup: "rounded-4 border border-secondary shadow-lg",
        confirmButton: "btn btn-danger rounded-3 px-4",
        cancelButton: "btn btn-secondary rounded-3 px-4",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/projects?id=${project.id}`, { method: "DELETE" });
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Project telah dihapus.",
          background: "#212529",
          color: "#fff",
          confirmButtonColor: "#0d6efd",
          timer: 1500,
          showConfirmButton: false,
        });
        router.refresh();
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal menghapus project dari database.",
          background: "#212529",
          color: "#fff",
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        background: "#212529",
        color: "#fff",
      });
    }
  };

  return (
    <>
      {/* Tombol Titik Tiga Dropdown */}
      <div className="dropdown position-absolute top-0 end-0 m-3" style={{ zIndex: 5 }}>
        <button
          className="btn btn-sm btn-dark border-secondary text-white-50 rounded-circle d-flex align-items-center justify-content-center shadow-sm"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={{ width: "32px", height: "32px" }}
          title="Menu Aksi"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
          </svg>
        </button>
        <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow border-secondary rounded-3 py-1">
          <li>
            <button
              className="dropdown-item d-flex align-items-center gap-2 py-2"
              type="button"
              onClick={() => setShowEditModal(true)}
            >
              <span className="text-warning">✏️</span> Edit Project
            </button>
          </li>
          <li><hr className="dropdown-divider border-secondary my-1" /></li>
          <li>
            <button
              className="dropdown-item d-flex align-items-center gap-2 text-danger py-2"
              type="button"
              onClick={handleDelete}
            >
              <span>🗑️</span> Hapus Project
            </button>
          </li>
        </ul>
      </div>

      {/* Render Modal via Portal langsung di document.body */}
      {showEditModal && mounted && createPortal(
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 999999,
          }}
        >
          <div
            className="card bg-dark text-white border-secondary rounded-4 shadow-lg d-flex flex-column"
            style={{
              maxWidth: "600px",
              width: "100%",
              maxHeight: "85vh",
            }}
          >
            {/* Header Modal */}
            <div className="card-header border-secondary p-3 flex-shrink-0 d-flex justify-content-between align-items-center bg-transparent">
              <h5 className="fw-bold m-0 text-white">Edit Project</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowEditModal(false)}
              ></button>
            </div>

            {/* Form & Scrollable Body */}
            <form onSubmit={handleUpdate} className="d-flex flex-column flex-grow-1 overflow-hidden">
              <div className="p-4 overflow-y-auto flex-grow-1">
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Judul Project</label>
                  <input
                    type="text"
                    className="form-control bg-secondary text-white border-dark rounded-3"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-white-50 small">Deskripsi</label>
                  <textarea
                    rows={4}
                    className="form-control bg-secondary text-white border-dark rounded-3"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-white-50 small">Tags (pisahkan dengan koma)</label>
                  <input
                    type="text"
                    className="form-control bg-secondary text-white border-dark rounded-3"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-bold small m-0">Tautan / Links</label>
                    <button
                      type="button"
                      onClick={addLinkField}
                      className="btn btn-sm btn-outline-info rounded-pill px-2 py-0"
                    >
                      + Tambah Link
                    </button>
                  </div>

                  {links.map((link, idx) => (
                    <div key={idx} className="d-flex gap-2 mb-2">
                      <input
                        type="text"
                        className="form-control bg-secondary text-white border-dark rounded-3"
                        style={{ maxWidth: "35%" }}
                        placeholder="Label"
                        required
                        value={link.label}
                        onChange={(e) => handleLinkChange(idx, "label", e.target.value)}
                      />
                      <input
                        type="url"
                        className="form-control bg-secondary text-white border-dark rounded-3 flex-grow-1"
                        placeholder="URL"
                        required
                        value={link.url}
                        onChange={(e) => handleLinkChange(idx, "url", e.target.value)}
                      />
                      {links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLinkField(idx)}
                          className="btn btn-outline-danger rounded-3 px-3"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Modal */}
              <div className="p-3 border-top border-secondary flex-shrink-0 d-flex justify-content-end gap-2 bg-dark">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-warning rounded-pill px-4"
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}