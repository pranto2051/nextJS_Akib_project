import { ArrowLeft, Check } from "lucide-react";
import { notFound } from "next/navigation";

import { PageHero, SiteShell } from "@/components/layout/SiteShell";
import { GlassCard } from "@/components/shared/primitives";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { getService } from "@/lib/content.functions";

interface ServicePageProps {
  params: {
    slug: string;
  };
}

async function getServiceData(slug: string) {
  const service = await getService(slug);
  if (!service) {
    notFound();
  }
  return service;
}

export async function generateMetadata({ params }: ServicePageProps) {
  const service = await getServiceData(params.slug);
  
  return {
    title: `${service.title} — KeekSurge`,
    description: service.short_desc,
    openGraph: {
      title: `${service.title} — KeekSurge`,
      description: service.short_desc,
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const service = await getServiceData(params.slug);

  return (
    <SiteShell>
      <PageHero eyebrow="Service" title={service.title} description={service.short_desc} />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <a
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All services
        </a>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {service.long_desc}
            </p>

            <h2 className="mt-12 text-xl font-bold">What's included</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {service.features.map((feature) => (
                <li key={feature} className="flex gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-12 text-xl font-bold">Business outcomes</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {service.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {service.faqs.length > 0 ? (
              <>
                <h2 className="mt-12 text-xl font-bold">Questions about this service</h2>
                <div className="mt-5 divide-y divide-border/60 rounded-xl border border-border/60">
                  {service.faqs.map((faq) => (
                    <details key={faq.question} className="px-5 py-4">
                      <summary className="cursor-pointer list-none text-sm font-semibold">
                        {faq.question}
                      </summary>
                      <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <aside className="space-y-6">
            <ScrollReveal>
              <GlassCard hover={false} className="p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
                  Technology
                </h3>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {service.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>

            {service.pricing_overview ? (
              <GlassCard hover={false} className="p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
                  Engagement
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{service.pricing_overview}</p>
              </GlassCard>
            ) : null}

            <GlassCard hover={false} className="p-6">
              <h3 className="text-base font-semibold">Start with discovery</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                One week, fixed fee, written architecture plan you keep either way.
              </p>
              <a
                href="/contact"
                className="mt-4 inline-flex w-full justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                style={{ backgroundImage: "var(--gradient-brand)" }}
              >
                Request a quote
              </a>
            </GlassCard>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}