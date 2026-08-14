"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectModalAdmin() {
  const router = useRouter();
  const [secretKey, setSecretKey] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [links, setLinks] = useState<{ label: string; url: string }[]>([
    { label: "View Project", url: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddLink = () => {
    setLinks([...links, { label: "View website deployment", url: "" }]);
  };

  const handleLinkChange = (index: number, field: "label" | "url", value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, tags, links, secretKey }),
      });

      const data = await res.json();
      if (data.success) {
        setTitle("");
        setDescription("");
        setTags("");
        setLinks([{ label: "View Project", url: "" }]);
        setMessage("Berhasil menambahkan project!");
        router.refresh();
      } else {
        setMessage(data.message || "Gagal menyimpan!");
      }
    } catch (err: any) {
      setMessage("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade" id="adminProjectModal" tabIndex={-1} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-dark text-white border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title fw-bold">Tambah Data Project</h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {message && <div className="alert alert-info p-2">{message}</div>}

              <div className="mb-3">
                <label className="form-label">Secret Key Admin</label>
                <input
                  type="password"
                  placeholder="Masukkan Secret Key (e.g. fandy123)"
                  className="form-control bg-secondary text-white border-dark"
                  required
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Judul Project</label>
                <input
                  type="text"
                  placeholder="Contoh: Sistem Pencatatan Prestasi Mahasiswa"
                  className="form-control bg-secondary text-white border-dark"
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
                  className="form-control bg-secondary text-white border-dark"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Tags (Pisahkan koma)</label>
                <input
                  type="text"
                  placeholder="Laravel, MySQL, Tailwind, Bootstrap"
                  className="form-control bg-secondary text-white border-dark"
                  required
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label d-block">Hyperlinks (Multiple)</label>
                {links.map((item, idx) => (
                  <div key={idx} className="d-flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Label (e.g. View Project)"
                      className="form-control bg-secondary text-white border-dark"
                      value={item.label}
                      onChange={(e) => handleLinkChange(idx, "label", e.target.value)}
                      required
                    />
                    <input
                      type="url"
                      placeholder="URL (https://github.com/...)"
                      className="form-control bg-secondary text-white border-dark"
                      value={item.url}
                      onChange={(e) => handleLinkChange(idx, "url", e.target.value)}
                      required
                    />
                    {links.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleRemoveLink(idx)}
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info"
                  onClick={handleAddLink}
                >
                  + Tambah Link Lain
                </button>
              </div>
            </div>
            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Tutup
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}