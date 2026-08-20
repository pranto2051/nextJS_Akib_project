"use server";

import { z } from "zod";
import { createServiceClient } from "@/integrations/supabase/client.server";
import type { Json } from "@/types";

type AdminRow = Record<string, Json>;

/** Tables the admin CMS is allowed to manage. */
const ADMIN_TABLES = [
  "site_settings",
  "services",
  "products",
  "product_categories",
  "product_requests",
  "admin_activity_log",
  "profiles",
  "projects",
  "categories",
  "blog_posts",
  "team_members",
  "testimonials",
  "faqs",
  "careers",
  "contact_messages",
  "applications",
  "newsletter_subscribers",
  "media_files",
] as const;

const tableSchema = z.enum(ADMIN_TABLES);

const listSchema = z.object({
  table: tableSchema,
  orderBy: z.string().max(60).optional(),
  ascending: z.boolean().optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

const rowSchema = z.record(z.string(), z.unknown());

const upsertSchema = z.object({
  table: tableSchema,
  values: rowSchema,
});

const deleteSchema = z.object({
  table: tableSchema,
  id: z.string().uuid(),
});

export async function adminList(input: z.infer<typeof listSchema>) {
  const supabase = createServiceClient();
  const validated = listSchema.parse(input);
  let query = supabase.from(validated.table).select("*");
  if (validated.orderBy) query = query.order(validated.orderBy, { ascending: validated.ascending ?? true });
  const { data: rows, error } = await query.limit(validated.limit ?? 200);
  if (error) throw new Error(error.message);
  return (rows ?? []) as unknown as AdminRow[];
}

export async function adminUpsert(input: z.infer<typeof upsertSchema>) {
  const supabase = createServiceClient();
  const validated = upsertSchema.parse(input);
  const { data: row, error } = await supabase
    .from(validated.table)
    .upsert(validated.values as never)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (row ?? null) as unknown as AdminRow | null;
}

export async function adminDelete(input: z.infer<typeof deleteSchema>) {
  const supabase = createServiceClient();
  const validated = deleteSchema.parse(input);
  const { error } = await supabase.from(validated.table).delete().eq("id", validated.id);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function adminStats() {
  const supabase = createServiceClient();
  const tables = ["services", "products", "projects", "blog_posts", "contact_messages", "applications", "newsletter_subscribers"] as const;
  const entries = await Promise.all(
    tables.map(async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select("id", { count: "exact", head: true });
      if (error) throw new Error(error.message);
      return [table, count ?? 0] as const;
    }),
  );
  const { count: unread } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("status", "UNREAD");
  return { counts: Object.fromEntries(entries), unreadMessages: unread ?? 0 };
}

/** Records an audit-log entry. Used after every key admin mutation. */
export async function logActivity(input: {
  action: string;
  entity_type: string;
  entity_id?: string;
  detail?: Record<string, unknown>;
}) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("admin_activity_log").insert({
    actor_id: "system",
    actor_name: "System",
    action: input.action,
    entity_type: input.entity_type,
    entity_id: input.entity_id ?? null,
    detail: (input.detail ?? null) as never,
  } as never);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

/** Lead pipeline metrics for the admin dashboard and requests page. */
export async function leadStats() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("product_requests")
    .select("id, product_id, status, created_at, updated_at");
  if (error) throw new Error(error.message);

  const { data: products } = await supabase
    .from("products")
    .select("id, display_name, category_id");
  const { data: categories } = await supabase
    .from("product_categories")
    .select("id, name");

  const rows = data ?? [];
  const now = Date.now();
  const dayMs = 86_400_000;

  const byStatus: Record<string, number> = {
    NEW: 0,
    CONTACTED: 0,
    INTERESTED: 0,
    CONVERTED: 0,
    LOST: 0,
  };
  const byProduct: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let today = 0;
  let week = 0;
  let contactDurations = 0;
  let contactCount = 0;

  const productName = new Map(
    (products ?? []).map((p) => [p.id as string, p.display_name as string]),
  );
  const productCategory = new Map(
    (products ?? []).map((p) => [p.id as string, (p.category_id as string | null) ?? ""]),
  );
  const categoryName = new Map((categories ?? []).map((c) => [c.id as string, c.name as string]));

  for (const row of rows) {
    const status = String(row.status);
    byStatus[status] = (byStatus[status] ?? 0) + 1;
    const created = new Date(row.created_at as string).getTime();
    if (now - created < dayMs) today += 1;
    if (now - created < dayMs * 7) week += 1;

    const label = productName.get(row.product_id as string) ?? "Unknown";
    byProduct[label] = (byProduct[label] ?? 0) + 1;
    const catId = productCategory.get(row.product_id as string) ?? "";
    const catLabel = categoryName.get(catId) ?? "Uncategorised";
    byCategory[catLabel] = (byCategory[catLabel] ?? 0) + 1;

    if (status !== "NEW") {
      const updated = new Date(row.updated_at as string).getTime();
      if (updated > created) {
        contactDurations += updated - created;
        contactCount += 1;
      }
    }
  }

  const top = (record: Record<string, number>) =>
    Object.entries(record).sort((a, b) => b[1] - a[1])[0] ?? null;

  return {
    total: rows.length,
    today,
    week,
    byStatus,
    byProduct,
    byCategory,
    topProduct: top(byProduct),
    topCategory: top(byCategory),
    conversionRate: rows.length ? (byStatus['CONVERTED'] ?? 0) / rows.length : 0,
    avgHoursToContact: contactCount ? contactDurations / contactCount / 3_600_000 : null,
  };
}