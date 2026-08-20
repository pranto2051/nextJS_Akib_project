import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { notFound } from "next/navigation";

import { PageHero, SiteShell } from "@/components/layout/SiteShell";
import { GlassCard } from "@/components/shared/primitives";
import { getBlogPost } from "@/lib/content.functions";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

async function getBlogPostData(slug: string) {
  const post = await getBlogPost(slug);
  if (!post) {
    notFound();
  }
  return post;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await getBlogPostData(params.slug);

  return {
    title: `${post.title} — KeekSurge Insights`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} — KeekSurge Insights`,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostData(params.slug);

  return (
    <SiteShell>
      <PageHero eyebrow="Blog" title={post.title} description={post.excerpt} />

      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <a
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </a>

        <div className="mt-8 flex flex-wrap items-center gap-4 border-b border-border/60 pb-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-4 w-4 text-accent" /> {post.author_name}
          </span>
          {post.published_at ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-accent" />
              {new Date(post.published_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          ) : null}
          {post.reading_time ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-accent" /> {post.reading_time} min read
            </span>
          ) : null}
        </div>

        <div
          className="mt-8 h-64 w-full rounded-xl opacity-80 sm:h-96"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        />

        <div
          className="prose prose-invert mt-12 max-w-none text-base leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags.length > 0 ? (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-border/60 pt-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <GlassCard hover={false} className="mt-16 p-8 text-center">
          <h3 className="text-xl font-bold">Have a project in mind?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Let's discuss how we can build custom software for your operational needs.
          </p>
          <a
            href="/contact"
            className="mt-6 inline-flex rounded-md px-6 py-3 text-sm font-semibold text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            Get in touch
          </a>
        </GlassCard>
      </article>
    </SiteShell>
  );
}
