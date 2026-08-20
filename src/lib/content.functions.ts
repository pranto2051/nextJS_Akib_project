import { createPublicClient } from "@/lib/supabase-public.server";
import type {
  BlogPost,
  Career,
  Category,
  Faq,
  Product,
  Project,
  Service,
  SiteSettings,
  TeamMember,
  Testimonial,
} from "@/types";

export async function getSiteSettings() {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  return data as SiteSettings | null;
}

export async function getServices() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Service[];
}

export async function getService(slug: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Service | null;
}

export async function getProducts() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function getProduct(slug: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Product | null;
}

export async function getProjects() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .order("completed_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Project[];
}

export async function getProject(slug: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Project | null;
}

export async function getBlogPosts() {
  const supabase = createPublicClient();
  const [posts, categories] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);
  if (posts.error) throw new Error(posts.error.message);
  if (categories.error) throw new Error(categories.error.message);
  return {
    posts: (posts.data ?? []) as BlogPost[],
    categories: (categories.data ?? []) as Category[],
  };
}

export async function getBlogPost(slug: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as BlogPost | null;
}

export async function getTeam() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as TeamMember[];
}

export async function getTestimonials() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Testimonial[];
}

export async function getFaqs() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Faq[];
}

export async function getCareers() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("careers")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Career[];
}

export async function getCareer(slug: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("careers")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Career | null;
}