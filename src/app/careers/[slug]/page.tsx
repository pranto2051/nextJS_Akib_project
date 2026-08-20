import { ArrowLeft, Briefcase, Check, MapPin } from "lucide-react";
import { notFound } from "next/navigation";

import { PageHero, SiteShell } from "@/components/layout/SiteShell";
import { GlassCard } from "@/components/shared/primitives";
import { getCareer } from "@/lib/content.functions";
import { ApplicationForm } from "./ApplicationForm";

interface CareerPageProps {
  params: {
    slug: string;
  };
}

async function getCareerData(slug: string) {
  const career = await getCareer(slug);
  if (!career) {
    notFound();
  }
  return career;
}

export async function generateMetadata({ params }: CareerPageProps) {
  const career = await getCareerData(params.slug);

  return {
    title: `${career.title} — KeekSurge`,
    description: career.description,
    openGraph: {
      title: `${career.title} — KeekSurge`,
      description: career.description,
    },
  };
}

export default async function CareerDetailPage({ params }: CareerPageProps) {
  const career = await getCareerData(params.slug);

  return (
    <SiteShell>
      <PageHero eyebrow={career.department} title={career.title} />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <a
          href="/careers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All roles
        </a>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" /> {career.department}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {career.location}
              </span>
              <span>{career.type.replace("_", " ").toLowerCase()}</span>
              <span>{career.experience}</span>
              {career.salary ? <span>{career.salary}</span> : null}
            </div>

            <p className="mt-8 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {career.description}
            </p>

            <h2 className="mt-10 text-xl font-bold">Requirements</h2>
            <ul className="mt-4 space-y-2.5">
              {career.requirements.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-xl font-bold">Benefits</h2>
            <ul className="mt-4 space-y-2.5">
              {career.benefits.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {career.deadline ? (
              <GlassCard hover={false} className="mt-10 p-5">
                <p className="text-sm">
                  Applications close on{" "}
                  <span className="font-semibold">
                    {new Date(career.deadline).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  .
                </p>
              </GlassCard>
            ) : null}
          </div>

          <div>
            <ApplicationForm careerId={career.id} />
          </div>
        </div>
      </div>
    </SiteShell>
  );
}