import { ArrowLeft, Check, Layers, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { PageHero, SiteShell } from "@/components/layout/SiteShell";
import { GlassCard } from "@/components/shared/primitives";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { getProductDetail } from "@/lib/catalog.functions";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

async function getProductData(slug: string) {
  const data = await getProductDetail(slug);
  if (!data || !data.product) {
    notFound();
  }
  return data;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const data = await getProductData(params.slug);
  const { product } = data;

  return {
    title: `${product.display_name || product.name} — KeekSurge Products`,
    description: product.description,
    openGraph: {
      title: `${product.display_name || product.name} — KeekSurge Products`,
      description: product.description,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { product, related, faqs, category } = await getProductData(params.slug);

  return (
    <SiteShell>
      <PageHero
        eyebrow={category?.name || product.kind.replace("_", " ")}
        title={product.display_name || product.name}
        description={product.tagline || product.description}
      />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <a
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All products
        </a>

        <div
          className="mt-8 h-64 w-full rounded-xl opacity-75 sm:h-80"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <h2 className="text-2xl font-bold">Overview</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {product.features.length > 0 ? (
              <>
                <h2 className="mt-12 text-xl font-bold">Key Features</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {product.benefits && product.benefits.length > 0 ? (
              <>
                <h2 className="mt-12 text-xl font-bold">Benefits & Value</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {product.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2.5 text-sm">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {product.hardware_specs && product.hardware_specs.length > 0 ? (
              <>
                <h2 className="mt-12 text-xl font-bold">Hardware Specifications</h2>
                <div className="mt-5 divide-y divide-border/60 rounded-xl border border-border/60">
                  {product.hardware_specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between px-5 py-3.5 text-sm">
                      <span className="font-semibold">{spec.label}</span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {faqs.length > 0 ? (
              <>
                <h2 className="mt-12 text-xl font-bold">Product FAQ</h2>
                <div className="mt-5 divide-y divide-border/60 rounded-xl border border-border/60">
                  {faqs.map((faq) => (
                    <details key={faq.id} className="px-5 py-4">
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
            <GlassCard hover={false} className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
                Product Details
              </h3>
              <dl className="mt-4 space-y-3.5 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Type</dt>
                  <dd className="mt-1 font-medium">{product.kind.replace("_", " ")}</dd>
                </div>
                {product.price_note ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">Pricing</dt>
                    <dd className="mt-1 font-medium">{product.price_note}</dd>
                  </div>
                ) : null}
              </dl>
              <a
                href="/contact"
                className="mt-6 inline-flex w-full justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                style={{ backgroundImage: "var(--gradient-brand)" }}
              >
                Request Product Demo
              </a>
            </GlassCard>

            {related.length > 0 ? (
              <GlassCard hover={false} className="p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
                  Related Products
                </h3>
                <div className="mt-4 space-y-3">
                  {related.map((rel) => (
                    <a
                      key={rel.id}
                      href={`/products/${rel.slug}`}
                      className="block rounded-lg border border-border/60 p-3 text-sm transition-colors hover:bg-secondary"
                    >
                      <p className="font-semibold">{rel.display_name || rel.name}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{rel.tagline}</p>
                    </a>
                  ))}
                </div>
              </GlassCard>
            ) : null}
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}
