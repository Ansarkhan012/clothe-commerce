import { z } from "zod";

const optionalText = z.string().trim().max(500).optional().nullable();
const money = z.number().nonnegative().max(99_999_999);
const uuid = z.string().uuid();

export const ProductVariantSchema = z.object({
  id: uuid.optional(), color_id: uuid.nullable(), size: z.enum(["XS","S","M","L","XL","XXL"]).nullable(),
  sku: z.string().trim().min(1).max(100), stock_quantity: z.number().nonnegative(),
  price_override: money.nullable(), image_url: z.string().url().nullable(), is_active: z.boolean(),
}).strict();

const ProductBaseSchema = z.object({
  title:z.string().trim().min(2).max(160), slug:z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  short_description:optionalText, description:z.string().trim().max(5000).optional().nullable(), category_id:uuid.nullable(),
  subcategory_id:uuid.nullable(), collection_ids:z.array(uuid).max(20), price:money.positive(), sale_price:money.nullable(),
  compare_at_price:money.nullable(), base_sku:z.string().trim().max(100).optional().nullable(), primary_color_id:uuid.nullable(),
  additional_color_ids:z.array(uuid).max(20), images:z.array(z.string().url()).min(1).max(10), featured:z.boolean(),
  is_new:z.boolean(), status:z.enum(["draft","active","archived"]), is_active:z.boolean(), seo_title:z.string().max(70).optional().nullable(),
  seo_description:z.string().max(170).optional().nullable(), stock:z.number().nonnegative(), variants:z.array(ProductVariantSchema).max(300),
  details:z.record(z.string(),z.unknown()),
});

export const ProductInputSchema = z.discriminatedUnion("product_type", [
  ProductBaseSchema.extend({product_type:z.literal("unstitched"),details:z.object({pieces:z.number().int().min(1).max(3),fabric:optionalText,work_type:optionalText,season:optionalText,shirt:z.record(z.string(),z.unknown()).optional(),trouser:z.record(z.string(),z.unknown()).optional(),dupatta:z.record(z.string(),z.unknown()).optional()}).passthrough()}),
  ProductBaseSchema.extend({product_type:z.literal("ready_to_wear"),stock:z.literal(0),details:z.object({garment_type:z.string().trim().min(1),fabric:z.string().trim().min(1),work_type:optionalText}).passthrough()}).refine(v=>v.variants.length>0,{message:"Ready to wear requires at least one variant",path:["variants"]}),
  ProductBaseSchema.extend({product_type:z.literal("loose_fabric"),variants:z.array(ProductVariantSchema).max(0),details:z.object({fabric:z.string().trim().min(1),work_type:optionalText,selling_unit:z.enum(["meter","yard"]),width:z.number().positive(),minimum_quantity:z.number().positive(),quantity_step:z.number().positive()}).passthrough()}),
  ProductBaseSchema.extend({product_type:z.literal("dupatta"),details:z.object({fabric:z.string().trim().min(1),work_type:optionalText,length:z.number().positive(),width:z.number().positive()}).passthrough()}),
  ProductBaseSchema.extend({product_type:z.literal("shawl"),details:z.object({fabric:z.string().trim().min(1),work_type:optionalText,season:optionalText,length:z.number().positive(),width:z.number().positive()}).passthrough()}),
]).superRefine((value,ctx)=>{
  if(value.sale_price!==null&&value.sale_price>=value.price)ctx.addIssue({code:"custom",message:"Sale price must be lower than price",path:["sale_price"]});
  if(value.compare_at_price!==null&&value.compare_at_price<=(value.sale_price??value.price))ctx.addIssue({code:"custom",message:"Compare-at price must exceed the selling price",path:["compare_at_price"]});
  if(value.product_type!=="loose_fabric"&&!Number.isInteger(value.stock))ctx.addIssue({code:"custom",message:"Base stock must be a whole number",path:["stock"]});
  if(value.product_type==="ready_to_wear"&&!value.variants.some(v=>v.is_active))ctx.addIssue({code:"custom",message:"Ready to wear requires an active variant",path:["variants"]});
  if(value.variants.some(v=>!Number.isInteger(v.stock_quantity)))ctx.addIssue({code:"custom",message:"Variant stock must be a whole number",path:["variants"]});
  if(value.product_type==="ready_to_wear"&&value.variants.some(v=>v.is_active&&v.size===null))ctx.addIssue({code:"custom",message:"Active ready-to-wear variants require a size",path:["variants"]});
  if(value.product_type!=="ready_to_wear"&&value.variants.some(v=>v.size!==null))ctx.addIssue({code:"custom",message:"Sizes are only valid for ready to wear",path:["variants"]});
  const skus=value.variants.map(v=>v.sku.trim().toLowerCase());
  if(new Set(skus).size!==skus.length)ctx.addIssue({code:"custom",message:"Variant SKUs must be unique",path:["variants"]});
});

export type ProductInput=z.infer<typeof ProductInputSchema>;
