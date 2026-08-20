"use server";

import { z } from "zod";
import { createServiceClient } from "@/integrations/supabase/client.server";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  service: z.string().trim().max(120).optional().or(z.literal("")),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(4000),
});

export async function submitContactMessage(input: z.infer<typeof contactSchema>) {
  const supabase = createServiceClient();
  const validated = contactSchema.parse(input);
  const { error } = await supabase.from("contact_messages").insert({
    name: validated.name,
    email: validated.email,
    phone: validated.phone || null,
    company: validated.company || null,
    service: validated.service || null,
    budget: validated.budget || null,
    message: validated.message,
  });
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

const applicationSchema = z.object({
  career_id: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(40),
  cover_letter: z.string().trim().min(20).max(5000),
  resume_url: z.string().trim().url().max(500).optional().or(z.literal("")),
});

export async function submitApplication(input: z.infer<typeof applicationSchema>) {
  const supabase = createServiceClient();
  const validated = applicationSchema.parse(input);
  const { error } = await supabase.from("applications").insert({
    career_id: validated.career_id,
    name: validated.name,
    email: validated.email,
    phone: validated.phone,
    cover_letter: validated.cover_letter,
    resume_url: validated.resume_url || null,
  });
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function subscribeNewsletter(input: { email: string }) {
  const supabase = createServiceClient();
  const validated = z.object({ email: z.string().trim().email().max(255) }).parse(input);
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email: validated.email.toLowerCase() }, { onConflict: "email" });
  if (error) throw new Error(error.message);
  return { ok: true as const };
}