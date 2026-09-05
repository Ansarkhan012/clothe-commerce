export const productTypes = ["unstitched", "ready_to_wear", "loose_fabric", "dupatta", "shawl"] as const;
export type ProductType = (typeof productTypes)[number];
export type ProductStatus = "draft" | "active" | "archived";
export type GarmentSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type FabricUnit = "meter" | "yard";

export interface CatalogCategory { id:string; name:string; slug:string; description:string|null; image_url:string|null; parent_id:string|null; sort_order:number; is_active:boolean }
export interface CatalogCollection { id:string; name:string; slug:string; description:string|null; image_url:string|null; sort_order:number; is_active:boolean }
export interface CatalogColor { id:string; name:string; slug:string; hex_code:string|null; sort_order:number; is_active:boolean }
export interface ProductVariant { id:string; product_id:string; color_id:string|null; size:GarmentSize|null; sku:string; stock_quantity:number; price_override:number|null; image_url:string|null; is_active:boolean; color?:CatalogColor|null }
export interface PieceDetail { included:boolean; fabric?:string; length?:number; width?:number }
export interface ProductDetails {
  pieces:number|null; fabric:string|null; garment_type:string|null; work_type:string|null; season:string|null;
  selling_unit:FabricUnit|null; width:number|null; length:number|null; minimum_quantity:number|null;
  quantity_step:number|null; care_instructions:string|null; shirt:PieceDetail|null; trouser:PieceDetail|null; dupatta:PieceDetail|null;
}

export const productTypeLabels:Record<ProductType,string> = {
  unstitched:"Unstitched Suit", ready_to_wear:"Ready to Wear", loose_fabric:"Loose Fabric", dupatta:"Dupatta", shawl:"Shawl",
};

