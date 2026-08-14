"use client";

import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// Setup SweetAlert Dark Theme
const DarkSwal = Swal.mixin({
  background: "#2d3748",
  color: "#e2e8f0",
  confirmButtonColor: "#e53e3e",
  cancelButtonColor: "#718096",
});

export default function DeleteProjectBtn({ id }: { id: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    // 1. Popup Konfirmasi Dark
    const result = await DarkSwal.fire({
      title: "Hapus Project?",
      text: "Data project ini beserta link-nya akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    // 2. Eksekusi Hapus Jika Diklik 'Ya, Hapus!'
    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/projects", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          await DarkSwal.fire({
            icon: "success",
            title: "Terhapus!",
            text: "Project berhasil dihapus.",
            timer: 1500,
            showConfirmButton: false,
          });
          router.refresh();
        } else {
          DarkSwal.fire({
            icon: "error",
            title: "Gagal",
            text: data.message || "Gagal menghapus project.",
          });
        }
      } catch {
        DarkSwal.fire({
          icon: "error",
          title: "Error",
          text: "Terjadi kesalahan jaringan saat menghapus.",
        });
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-3 rounded-circle d-flex align-items-center justify-content-center"
      title="Hapus Project"
      style={{ zIndex: 10, width: "34px", height: "34px" }}
    >
      <i className="fas fa-trash" style={{ fontSize: "0.85em" }}></i>
    </button>
  );
}