import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  BlogPost,
  Career,
  Category,
  Faq,
  Product,
  ProductCategory,
  Project,
  Service,
  SiteSettings,
  TeamMember,
  Testimonial,
} from "@/types";

export const settingsQuery = queryOptions({
  queryKey: ["site-settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    if (error) throw new Error(error.message);
    return data as unknown as SiteSettings | null;
  },
  staleTime: 60_000,
});

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Service[];
  },
  staleTime: 60_000,
});

export const serviceQuery = (slug: string) =>
  queryOptions({
    queryKey: ["service", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as unknown as Service | null;
    },
    staleTime: 60_000,
  });

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Product[];
  },
  staleTime: 60_000,
});

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as unknown as Product | null;
    },
    staleTime: 60_000,
  });

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("completed_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Project[];
  },
  staleTime: 60_000,
});

export const projectQuery = (slug: string) =>
  queryOptions({
    queryKey: ["project", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as unknown as Project | null;
    },
    staleTime: 60_000,
  });

export const blogQuery = queryOptions({
  queryKey: ["blog"],
  queryFn: async () => {
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
      posts: (posts.data ?? []) as unknown as BlogPost[],
      categories: (categories.data ?? []) as unknown as Category[],
    };
  },
  staleTime: 60_000,
});

export const blogPostQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as unknown as BlogPost | null;
    },
    staleTime: 60_000,
  });

export const teamQuery = queryOptions({
  queryKey: ["team"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as TeamMember[];
  },
  staleTime: 60_000,
});

export const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Testimonial[];
  },
  staleTime: 60_000,
});

export const faqsQuery = queryOptions({
  queryKey: ["faqs"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Faq[];
  },
  staleTime: 60_000,
});

export const careersQuery = queryOptions({
  queryKey: ["careers"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("careers")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Career[];
  },
  staleTime: 60_000,
});

export const careerQuery = (slug: string) =>
  queryOptions({
    queryKey: ["career", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("careers")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as unknown as Career | null;
    },
    staleTime: 60_000,
  });

export const productCategoriesQuery = queryOptions({
  queryKey: ["product-categories"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("product_categories")
      .select("*")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as ProductCategory[];
  },
  staleTime: 60_000,
});

export const productDetailQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product-detail", slug],
    queryFn: async () => {
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
    },
    staleTime: 60_000,
  });

