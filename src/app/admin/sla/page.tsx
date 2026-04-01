import { redirect } from "next/navigation";

// Halaman Kelola SLA telah dihapus dari dashboard admin.
// Redirect ke halaman Overview jika URL diakses langsung.
export default function AdminSlaPage() {
  redirect("/admin");
}
