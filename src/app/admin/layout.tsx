import type { Metadata } from "next";
import { Sidebar } from "@/components/admin/Sidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard — Hostel Management",
  description: "Manage services, projects, blog posts, messages and site settings.",
  robots: "noindex",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 lg:ml-64 ml-0 pt-16 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}