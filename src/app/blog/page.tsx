import { Calendar, Clock, Tag, User } from "lucide-react";

import { EmptyState, PageHero, SiteShell } from "@/components/layout/SiteShell";
import { GlassCard, SectionHeading } from "@/components/shared/primitives";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { getBlogPosts } from "@/lib/content.functions";

export const metadata = {
  title: "Blog & Insights — KeekSurge",
  description: "Deep dives into hostel management systems, software architecture, database design and product engineering from our team in Dhaka.",
  openGraph: {
    title: "Blog & Insights — KeekSurge",
    description: "Engineering and product thinking from our delivery team.",
  },
};

export const dynamic = "force-dynamic";

async function getBlogData() {
  return await getBlogPosts();
}

export default async function BlogPage() {
  const { posts, categories } = await getBlogData();

  const featuredPost = posts.find((p) => p.is_featured) ?? posts[0];
  const regularPosts = posts.filter((p) => p.id !== featuredPost?.id);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Blog & Insights"
        title="Engineering thoughts & case studies"
        description="Lessons from building hostel platforms, ERP systems and enterprise applications for teams across Asia."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <EmptyState title="No articles published yet" description="Check back soon for new insights." />
          ) : (
            <>
              {/* FEATURED POST */}
              {featuredPost ? (
                <div className="mb-16">
                  <SectionHeading align="left" eyebrow="Featured" title="Latest deep dive" />
                  <div className="mt-8">
                    <ScrollReveal>
                      <a href={`/blog/${featuredPost.slug}`} className="block">
                        <GlassCard className="grid gap-8 p-8 lg:grid-cols-12">
                          <div
                            className="h-64 w-full rounded-xl opacity-80 lg:col-span-6 lg:h-auto"
                            style={{ backgroundImage: "var(--gradient-brand)" }}
                          />
                          <div className="flex flex-col justify-between lg:col-span-6">
                            <div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="rounded-full bg-accent/15 px-3 py-1 font-semibold text-accent">
                                  Featured
                                </span>
                                {featuredPost.published_at ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(featuredPost.published_at).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                ) : null}
                                {featuredPost.reading_time ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" /> {featuredPost.reading_time} min read
                                  </span>
                                ) : null}
                              </div>
                              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                                {featuredPost.title}
                              </h2>
                              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                {featuredPost.excerpt}
                              </p>
                            </div>
                            <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <User className="h-3.5 w-3.5" /> {featuredPost.author_name}
                              </span>
                              <span className="text-sm font-semibold text-accent">Read article →</span>
                            </div>
                          </div>
                        </GlassCard>
                      </a>
                    </ScrollReveal>
                  </div>
                </div>
              ) : null}

              {/* POSTS GRID */}
              {regularPosts.length > 0 ? (
                <div>
                  <SectionHeading align="left" eyebrow="Articles" title="Recent posts" />
                  <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {regularPosts.map((post, index) => (
                      <ScrollReveal key={post.id} delay={index * 50}>
                        <a href={`/blog/${post.slug}`} className="block h-full">
                          <GlassCard className="flex h-full flex-col justify-between p-6">
                            <div>
                              <div
                                className="mb-5 h-40 w-full rounded-lg opacity-70"
                                style={{ backgroundImage: "var(--gradient-brand)" }}
                              />
                              <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                                {post.published_at ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(post.published_at).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                ) : null}
                                {post.reading_time ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {post.reading_time} min read
                                  </span>
                                ) : null}
                              </div>
                              <h3 className="mt-3 text-lg font-semibold">{post.title}</h3>
                              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
                            </div>

                            <div className="mt-6 border-t border-border/60 pt-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  By {post.author_name}
                                </span>
                                <span className="text-xs font-semibold text-accent">Read →</span>
                              </div>
                            </div>
                          </GlassCard>
                        </a>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
