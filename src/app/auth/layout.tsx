import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Sign In — KeekSurge",
  description: "Sign in to the KeekSurge admin dashboard to manage services, projects, blog posts, messages and site settings.",
  robots: "noindex",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}