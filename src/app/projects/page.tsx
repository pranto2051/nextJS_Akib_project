"use client";

import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { EmptyState, PageHero, SiteShell, SkeletonGrid } from "@/components/layout/SiteShell";
import { GlassCard } from "@/components/shared/primitives";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { projectsQuery } from "@/lib/queries";

function ProjectsContent() {
  const { data: projects } = useSuspenseQuery(projectsQuery);
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "All";

  const categories = ["All", ...Array.from(new Set(projects.map((project) => project.category)))];
  const visible =
    category === "All" ? projects : projects.filter((project) => project.category === category);

  const updateCategory = (newCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory === "All") {
      params.delete("category");
    } else {
      params.set("category", newCategory);
    }
    window.history.pushState({}, "", `?${params.toString()}`);
  };

  return (
    <>
      <PageHero
        eyebrow="Our work"
        title="Case studies from live operations"
        description="Every project below is running in production today. Filter by the kind of work you need."
      />
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => updateCategory(item)}
                className={
                  category === item
                    ? "rounded-full px-4 py-1.5 text-sm font-semibold text-primary-foreground"
                    : "rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                }
                style={category === item ? { backgroundImage: "var(--gradient-brand)" } : undefined}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-10">
            {visible.length === 0 ? (
              <EmptyState
                title="No projects in this category"
                description="Try another filter or view all work."
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((project, index) => (
                  <ScrollReveal key={project.id} delay={index * 50}>
                    <a
                      href={`/projects/${project.slug}`}
                      className="block h-full"
                    >
                      <GlassCard className="h-full overflow-hidden">
                        <div
                          className="h-36 w-full opacity-70"
                          style={{ backgroundImage: "var(--gradient-brand)" }}
                        />
                        <div className="p-6">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                              {project.category}
                            </span>
                            {project.is_featured ? (
                              <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent">
                                Featured
                              </span>
                            ) : null}
                          </div>
                          <h2 className="mt-3 text-lg font-semibold">{project.title}</h2>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {project.short_desc}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {project.tech_stack.slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                            Read case study <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </GlassCard>
                    </a>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function ProjectsPage() {
  return (
    <SiteShell>
      <Suspense fallback={<SkeletonGrid />}>
        <ProjectsContent />
      </Suspense>
    </SiteShell>
  );
}

export default ProjectsPage;