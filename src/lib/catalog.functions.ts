import { z } from "zod";
import { createPublicClient } from "@/lib/supabase-public.server";
import type { Faq, Product, ProductCategory } from "@/types";

export async function getProductCategories() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ProductCategory[];
}

export async function getProductDetail(slug: string) {
  const supabase = createPublicClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!product) return null;

  const typed = product as unknown as Product;

  const [related, faqs, categories] = await Promise.all([
    typed.category_id
      ? supabase
          .from("products")
          .select("*")
          .eq("is_published", true)
          .eq("category_id", typed.category_id)
          .neq("id", typed.id)
          .order("sort_order")
          .limit(3)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("faqs")
      .select("*")
      .eq("is_published", true)
      .eq("product_id", typed.id)
      .order("sort_order"),
    supabase.from("product_categories").select("*"),
  ]);

  const category =
    (categories.data ?? []).find(
      (row) => (row as { id: string }).id === typed.category_id,
    ) ?? null;

  return {
    product: typed,
    related: ((related.data ?? []) as unknown as Product[]),
    faqs: ((faqs.data ?? []) as unknown as Faq[]),
    category: category as unknown as ProductCategory | null,
  };
}

const phoneRegex = /^01[3-9]\d{8}$/;

const requestSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, "").replace(/^(\+?88)/, ""))
    .refine((value) => phoneRegex.test(value), "Enter a valid mobile number, e.g. 01712345678"),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export async function submitProductRequest(input: z.infer<typeof requestSchema>) {
  const supabase = createPublicClient();
  const validated = requestSchema.parse(input);
  const { error } = await supabase.from("product_requests").insert({
    product_id: validated.product_id,
    name: validated.name,
    phone: validated.phone,
    message: validated.message || null,
    source: "website",
  } as never);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

