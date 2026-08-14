"use client";

import { useRouter } from "next/navigation";

export default function DeleteProjectBtn({ id }: { id: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Yakin ingin menghapus project ini?")) {
      const res = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal menghapus project");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
      title="Hapus Project"
      style={{ zIndex: 10, padding: "2px 8px" }}
    >
      <i className="fas fa-trash"></i>
    </button>
  );
}