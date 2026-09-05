import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/src/types/supabase";

export const productFields = "id,title,slug,product_type,short_description,description,price,sale_price,compare_at_price,category,category_id,subcategory_id,featured,is_new,is_active,status,images,sizes,stock,base_sku,primary_color_id,created_at,updated_at,details:product_details(*),variants:product_variants(*,color:colors(*)),category_record:categories!products_category_id_fkey(*),primary_color:colors!products_primary_color_id_fkey(*)";

function publicCatalogClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Catalog configuration is missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function normalizeProduct(row: Record<string, unknown>): Product {
  const one = <T>(value: unknown): T | null => Array.isArray(value) ? (value[0] as T | undefined) ?? null : (value as T | null);
  const variants = Array.isArray(row.variants) ? row.variants.filter((variant) => (variant as { is_active?: boolean }).is_active === true) : [];
  return { ...row, variants, details: one(row.details), category_record: one(row.category_record), primary_color: one(row.primary_color) } as Product;
}

export const getLatestProducts = unstable_cache(async (limit = 12) => {
  const { data, error } = await publicCatalogClient().from("products").select(productFields).eq("is_active", true).eq("status", "active").order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error("CATALOG_UNAVAILABLE");
  return (data ?? []).map((row)=>normalizeProduct(row));
}, ["latest-products"], { revalidate: 300, tags: ["products"] });

export const getSaleProducts = unstable_cache(async (limit = 100) => {
  const { data, error } = await publicCatalogClient().from("products").select(productFields).eq("is_active", true).eq("status", "active").not("sale_price", "is", null)
    .order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error("CATALOG_UNAVAILABLE");
  return (data ?? []).map((row)=>normalizeProduct(row));
}, ["sale-products"], { revalidate: 300, tags: ["products"] });

export const getProduct = unstable_cache(async (identifier: string) => {
  let query = publicCatalogClient().from("products").select(productFields).eq("is_active", true).eq("status", "active");
  query = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(identifier) ? query.eq("id", identifier) : query.eq("slug", identifier);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error("CATALOG_UNAVAILABLE");
  return data ? normalizeProduct(data) : null;
}, ["product-by-id"], { revalidate: 300, tags: ["products"] });

export const getRelatedProducts = unstable_cache(async (categoryId: string | null | undefined, excludedId: string) => {
  if (!categoryId) return [];
  const { data, error } = await publicCatalogClient().from("products").select(productFields).eq("is_active", true).eq("status", "active").eq("category_id", categoryId).neq("id", excludedId)
    .order("created_at", { ascending: false }).limit(4);
  if (error) throw new Error("CATALOG_UNAVAILABLE");
  return (data ?? []).map((row)=>normalizeProduct(row));
}, ["related-products"], { revalidate: 300, tags: ["products"] });

export type CatalogFilters = { q: string; category: string; productType: string; size: string; availability: string; sale: boolean; min: number | null; max: number | null; sort: string; page: number; pageSize: number };

export const getCatalogPage = unstable_cache(async (filters: CatalogFilters) => {
  let query = publicCatalogClient().from("products").select(productFields, { count: "exact" }).eq("is_active", true).eq("status", "active");
  const safe = filters.q.replace(/[%(),]/g, "");
  if (safe) query = query.or(`title.ilike.%${safe}%,category.ilike.%${safe}%,description.ilike.%${safe}%`);
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.productType) query = query.eq("product_type", filters.productType);
  if (filters.sale) query = query.not("sale_price", "is", null);
  if (filters.size) query = query.eq("product_variants.size", filters.size);
  if (filters.min !== null) query = query.gte("price", filters.min);
  if (filters.max !== null) query = query.lte("price", filters.max);
  if (filters.sort === "price_asc") query = query.order("price", { ascending: true });
  else if (filters.sort === "price_desc") query = query.order("price", { ascending: false });
  else if (filters.sort === "featured") query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
  else query = query.order("created_at", { ascending: false });
  const from = (filters.page - 1) * filters.pageSize;
  const { data, count, error } = await query.range(from, from + filters.pageSize - 1);
  if (error) throw new Error("CATALOG_UNAVAILABLE");
  let products = (data ?? []).map((row)=>normalizeProduct(row));
  if (filters.availability === "in_stock") products = products.filter((product) => {
    const variants = product.variants ?? [];
    return variants.length ? variants.some((variant) => Number(variant.stock_quantity) > 0) : Number(product.stock) > 0;
  });
  return { products, total: filters.availability === "in_stock" ? products.length : count ?? 0 };
}, ["catalog-page"], { revalidate: 120, tags: ["products"] });

export const getCatalogCategories = unstable_cache(async () => {
  const { data, error } = await publicCatalogClient().from("categories").select("id,name,slug").eq("is_active",true).order("sort_order").limit(500);
  if (error) throw new Error("CATALOG_UNAVAILABLE");
  return data ?? [];
}, ["catalog-categories"], { revalidate: 600, tags: ["products"] });

export const getCatalogCategoryItems = unstable_cache(async () => {
  const { data, error } = await publicCatalogClient().from("categories")
    .select("name,slug,image_url").eq("is_active",true).is("parent_id",null).order("sort_order").limit(100);
  if (error) throw new Error("CATALOG_UNAVAILABLE");
  return (data??[]).map(row=>({name:row.name,slug:row.slug,image_url:row.image_url??null}));
}, ["catalog-category-items"], { revalidate: 600, tags: ["products"] });

export const getSitemapProducts = unstable_cache(async () => {
  const { data, error } = await publicCatalogClient().from("products").select("id,slug,updated_at").eq("is_active", true).eq("status", "active").order("updated_at", { ascending: false }).limit(5000);
  if (error) throw new Error("CATALOG_UNAVAILABLE");
  return data ?? [];
}, ["sitemap-products"], { revalidate: 3600, tags: ["products"] });

export const getCategoryBySlug=unstable_cache(async(slug:string)=>{const {data,error}=await publicCatalogClient().from("categories").select("id,name,slug,description,image_url").eq("slug",slug).eq("is_active",true).maybeSingle();if(error)throw new Error("CATALOG_UNAVAILABLE");return data},["category-by-slug"],{revalidate:600,tags:["products"]});
