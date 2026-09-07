import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { requireAdmin } from "@/src/lib/auth/admin";
import { productInventory } from "@/src/lib/product-commerce";
import { productTypeLabels, productTypes, type ProductType } from "@/src/types/product";
import { ProductActions } from "@/src/components/admin/ProductActions";

export default async function ProductsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const raw=await searchParams;
 const value=(key:string)=>typeof raw[key]==="string"?raw[key] as string:"";
 const page=Math.max(1,Number(value("page"))||1),pageSize=25,search=value("q").replace(/[%(),]/g,""),category=value("category"),type=value("type"),status=value("status"),stock=value("stock"),notice=value("notice");
 const {serviceClient}=await requireAdmin();
 let query=serviceClient.from("products").select("id,title,product_type,category_id,price,sale_price,stock,images,status,is_active,updated_at,category_record:categories!products_category_id_fkey(name),variants:product_variants(id,stock_quantity,is_active)",{count:"exact"});
 if(search)query=query.ilike("title",`%${search}%`);
 if(category)query=query.eq("category_id",category);
 if(type)query=query.eq("product_type",type);
 if(status)query=query.eq("status",status);
 if(stock==="out")query=query.eq("stock",0);
 if(stock==="low")query=query.gt("stock",0).lte("stock",5);
 const from=(page-1)*pageSize;
 const [{data:products,count,error},{data:categories}]=await Promise.all([query.order("updated_at",{ascending:false}).range(from,from+pageSize-1),serviceClient.from("categories").select("id,name").eq("is_active",true).order("sort_order")]);
 if(error)throw new Error("PRODUCTS_UNAVAILABLE");
 const params=new URLSearchParams(Object.entries(raw).flatMap(([key,item])=>typeof item==="string"?[[key,item]]:[]));
 const href=(number:number)=>{params.set("page",String(number));return `/admin/products?${params}`};
 return <main className="mx-auto max-w-[1500px]">
 <div className="mb-6 flex items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold">Products</h2><p className="mt-1 text-sm text-[#6B7280]">{count??0} catalog products</p></div><Link href="/admin/products/new" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#1A1A1A] px-4 text-sm font-medium text-white"><Plus size={17}/>Add product</Link></div>
  {notice==="deleted"&&<p role="status" className="mb-5 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Product deleted successfully.</p>}{notice==="archived"&&<p role="status" className="mb-5 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Product archived and removed from the storefront.</p>}
  <form className="mb-5 grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-6"><label className="relative md:col-span-2"><Search className="absolute left-3 top-3" size={17}/><input name="q" defaultValue={search} placeholder="Search products" className="h-11 w-full rounded border pl-10"/></label><select name="type" defaultValue={type} className="h-11 rounded border px-2"><option value="">All types</option>{productTypes.map(item=><option key={item} value={item}>{productTypeLabels[item]}</option>)}</select><select name="category" defaultValue={category} className="h-11 rounded border px-2"><option value="">All categories</option>{categories?.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select><select name="status" defaultValue={status} className="h-11 rounded border px-2"><option value="">All statuses</option><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select><button className="h-11 rounded bg-[#1A1A1A] px-4 text-white">Apply</button></form>
  <div className="overflow-x-auto rounded-lg border bg-white"><table className="w-full min-w-[950px] text-left text-sm"><thead className="bg-[#F9FAFB] text-xs uppercase text-[#6B7280]"><tr>{["Product","Type","Category","Price","Inventory","Status","Updated","Actions"].map(heading=><th key={heading} className="px-5 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y">{products?.map(product=>{
   const inventory=product.product_type==="loose_fabric"?Number(product.stock):productInventory(product);
   const activeVariantCount=(product.variants??[]).filter(variant=>variant.is_active).length;
   const categoryRecord=Array.isArray(product.category_record)?product.category_record[0]:product.category_record;
   const inventoryText=product.product_type==="loose_fabric"?`${inventory.toLocaleString("en-PK")} m available`:activeVariantCount?`${inventory.toLocaleString("en-PK")} across ${activeVariantCount} active variants`:`${inventory.toLocaleString("en-PK")} in stock`;
   const inventoryStatus=inventory<=0?"Sold out":inventory<=5?"Low stock":null;
   return <tr key={product.id}><td className="px-5 py-3"><div className="flex items-center gap-3"><div className="relative h-12 w-10 bg-[#F6F7F9]">{product.images?.[0]&&<Image src={product.images[0]} alt="" fill sizes="40px" className="object-cover"/>}</div><span className="max-w-xs truncate font-medium">{product.title}</span></div></td><td className="px-5 py-3">{productTypeLabels[product.product_type as ProductType]}</td><td className="px-5 py-3 text-[#6B7280]">{categoryRecord?.name??"—"}</td><td className="px-5 py-3">Rs. {Number(product.sale_price??product.price).toLocaleString("en-PK")}</td><td className="px-5 py-3"><span>{inventoryText}</span>{inventoryStatus&&<span className={`ml-2 rounded-full px-2 py-1 text-xs ${inventory<=0?"bg-red-50 text-red-700":"bg-amber-50 text-amber-800"}`}>{inventoryStatus}</span>}</td><td className="px-5 py-3"><span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs">{product.is_active?product.status:"Inactive"}</span></td><td className="px-5 py-3 text-[#6B7280]">{new Date(product.updated_at).toLocaleDateString("en-PK")}</td><td className="px-5 py-3"><ProductActions id={product.id} title={product.title}/></td></tr>
  })}</tbody></table>{!products?.length&&<p className="p-10 text-center text-sm text-[#6B7280]">No products match.</p>}</div>
  <div className="mt-5 flex justify-between"><Link href={page===1?href(1):href(page-1)} className={`rounded border px-4 py-2 ${page===1?"pointer-events-none opacity-40":""}`}>Previous</Link><span>Page {page}</span><Link href={page*pageSize>=(count??0)?href(page):href(page+1)} className={`rounded border px-4 py-2 ${page*pageSize>=(count??0)?"pointer-events-none opacity-40":""}`}>Next</Link></div>
 </main>
}
