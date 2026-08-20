"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { GlassCard } from "@/components/shared/primitives";
import { submitApplication } from "@/lib/content.actions";

const FIELD_CLASS =
  "w-full rounded-md border border-input bg-surface px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export function ApplicationForm({ careerId }: { careerId: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (values: Record<string, string>) =>
      submitApplication({
        career_id: careerId,
        name: values['name'] ?? "",
        email: values['email'] ?? "",
        phone: values['phone'] ?? "",
        cover_letter: values['cover_letter'] ?? "",
        resume_url: values['resume_url'] ?? "",
      }),
    onSuccess: () => toast.success("Application received. We review every one within a week."),
    onError: () => toast.error("We couldn't submit that. Please check the fields and retry."),
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const next: Record<string, string> = {};
    if (!values['name'] || values['name'].trim().length < 2) next['name'] = "Enter your full name.";
    if (!values['email'] || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values['email']))
      next['email'] = "Enter a valid email.";
    if (!values['phone'] || values['phone'].trim().length < 6) next['phone'] = "Enter a contact number.";
    if (!values['cover_letter'] || values['cover_letter'].trim().length < 20)
      next['cover_letter'] = "Tell us why you're a fit (20 characters minimum).";
    if (values['resume_url'] && !/^https?:\/\//.test(values['resume_url']))
      next['resume_url'] = "Use a full URL starting with https://";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    mutation.mutate(values, { onSuccess: () => form.reset() });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="glass-card rounded-xl p-6">
      <h2 className="text-lg font-semibold">Apply for this role</h2>
      <div className="mt-5 grid gap-4">
        <div>
          <label htmlFor="app-name" className="mb-1.5 block text-sm font-medium">
            Full name *
          </label>
          <input id="app-name" name="name" maxLength={100} className={FIELD_CLASS} />
          {errors['name'] ? <p className="mt-1 text-xs text-destructive">{errors['name']}</p> : null}
        </div>
        <div>
          <label htmlFor="app-email" className="mb-1.5 block text-sm font-medium">
            Email *
          </label>
          <input id="app-email" name="email" type="email" maxLength={255} className={FIELD_CLASS} />
          {errors['email'] ? <p className="mt-1 text-xs text-destructive">{errors['email']}</p> : null}
        </div>
        <div>
          <label htmlFor="app-phone" className="mb-1.5 block text-sm font-medium">
            Phone *
          </label>
          <input id="app-phone" name="phone" maxLength={40} className={FIELD_CLASS} />
          {errors['phone'] ? <p className="mt-1 text-xs text-destructive">{errors['phone']}</p> : null}
        </div>
        <div>
          <label htmlFor="app-resume" className="mb-1.5 block text-sm font-medium">
            Resume link
          </label>
          <input
            id="app-resume"
            name="resume_url"
            maxLength={500}
            placeholder="https://drive.google.com/…"
            className={FIELD_CLASS}
          />
          {errors['resume_url'] ? (
            <p className="mt-1 text-xs text-destructive">{errors['resume_url']}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="app-cover" className="mb-1.5 block text-sm font-medium">
            Cover note *
          </label>
          <textarea id="app-cover" name="cover_letter" rows={5} maxLength={5000} className={FIELD_CLASS} />
          {errors['cover_letter'] ? (
            <p className="mt-1 text-xs text-destructive">{errors['cover_letter']}</p>
          ) : null}
        </div>
      </div>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="mt-6 w-full rounded-md px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        style={{ backgroundImage: "var(--gradient-brand)" }}
      >
        {mutation.isPending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
