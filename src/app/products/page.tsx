import * as Icons from "lucide-react";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { EmptyState, PageHero, SiteShell } from "@/components/layout/SiteShell";
import { GlassCard, SectionHeading } from "@/components/shared/primitives";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { getProducts } from "@/lib/content.functions";

export const metadata = {
  title: "Products — Hostel & Business Platforms | KeekSurge",
  description: "Explore our ready-to-deploy products including Hostel Management Suite, Biometric Attendance systems, and enterprise software.",
  openGraph: {
    title: "Products — KeekSurge",
    description: "Battle-tested software and hardware products built for operations.",
  },
};

export const dynamic = "force-dynamic";

function ProductIcon({ name }: { name: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Sparkles;
  return <Icon className="h-5 w-5 text-primary-foreground" />;
}

async function getProductsData() {
  return await getProducts();
}

export default async function ProductsPage() {
  const products = await getProductsData();

  return (
    <SiteShell>
      <PageHero
        eyebrow="Our Products"
        title="Software & Hardware Built for Scale"
        description="Battle-tested products engineered for hostels, enterprise operations, biometric access and modern business management."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {products.length === 0 ? (
            <EmptyState
              title="No products published yet"
              description="New products will be added here soon."
            />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 60}>
                  <a href={`/products/${product.slug}`} className="block h-full">
                    <GlassCard className="flex h-full flex-col justify-between p-6">
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <span
                            className="grid h-12 w-12 place-items-center rounded-xl"
                            style={{ backgroundImage: "var(--gradient-brand)" }}
                          >
                            <ProductIcon name={product.icon_name} />
                          </span>
                          <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-accent">
                            {product.kind.replace("_", " ")}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold">{product.display_name || product.name}</h2>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-accent">
                          {product.tagline}
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">{product.description}</p>

                        {product.features.length > 0 ? (
                          <ul className="mt-5 space-y-2">
                            {product.features.slice(0, 4).map((feature) => (
                              <li key={feature} className="flex gap-2 text-xs text-muted-foreground">
                                <Check className="h-4 w-4 shrink-0 text-accent" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>

                      <div className="mt-8 border-t border-border/60 pt-4">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                          View Product Details <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </GlassCard>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border/60 bg-surface/30 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Customization"
            title="Need a custom product configuration?"
            description="Our engineering team can adapt any product architecture to your exact operational requirements."
          />
          <a
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            Talk to an engineer <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
