import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies & Projects — KeekSurge",
  description: "Explore hostel platforms, ERP rollouts, mobile apps and IoT integrations we have delivered for clients across Asia and the Gulf.",
  openGraph: {
    title: "Case Studies — KeekSurge",
    description: "Real projects, real numbers, real technology stacks.",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}