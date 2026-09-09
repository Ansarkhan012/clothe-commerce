import type { MetadataRoute } from "next";
import { getSitemapProducts } from "@/src/lib/catalog";

const paths=["","/collections","/new-arrivals","/sale","/about","/contact","/track-order","/help-center","/shipping-policy","/return-exchange-policy","/refund-policy","/cancellation-policy","/privacy-policy","/terms-and-conditions","/cookies-policy","/disclaimer","/accessibility","/security-policy","/responsible-disclosure"];
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const configuredSiteUrl=process.env.NEXT_PUBLIC_SITE_URL?.trim();
 if(!configuredSiteUrl)return [];
 let base:string;
 try{base=new URL(configuredSiteUrl).origin}catch{return []}
 let products:Awaited<ReturnType<typeof getSitemapProducts>>=[];
 try{products=await getSitemapProducts()}catch{/* Static routes remain available during a catalog outage. */}
 return [...paths.map(path=>({url:`${base}${path}`,changeFrequency:(path===""?"daily":"monthly") as "daily"|"monthly",priority:path===""?1:.6})),...products.map(product=>({url:`${base}/product/${encodeURIComponent(product.slug||product.id)}`,lastModified:product.updated_at?new Date(product.updated_at):undefined,changeFrequency:"weekly" as const,priority:.8}))];
}
