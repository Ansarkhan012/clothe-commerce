import { createClient } from "@/src/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

// ✅ FIXED: params is Promise in Next.js 15
export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;  // ← MUST await before accessing
  
  const supabase = await createClient();
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}