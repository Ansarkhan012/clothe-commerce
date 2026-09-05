import type { OrderEmailData } from "@/src/lib/email/order-email-data";

export const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
}[character]!));

export const money = (value: number) => `Rs. ${Number(value).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
export const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function address(order: OrderEmailData) {
  return [order.delivery_address, order.address_line_2, order.area, order.city, order.province, order.postal_code]
    .filter(Boolean).map(escapeHtml).join("<br>");
}

export function itemsTable(order: OrderEmailData) {
  return order.items.map((item) => {
    const variant = item.product_type === "loose_fabric" && item.measurement_quantity && item.selling_unit
      ? `${item.measurement_quantity} ${item.selling_unit}${item.measurement_quantity === 1 ? "" : "s"}`
      : [item.color, item.size && `Size ${item.size}`, item.selection_details?.pieces && `${item.selection_details.pieces} Piece`].filter(Boolean).map(escapeHtml).join(" · ");
    const quantity = item.product_type === "loose_fabric" ? `${item.measurement_quantity} × ${money(item.unit_price)} / ${item.selling_unit}` : `${item.quantity} × ${money(item.unit_price)}`;
    return `<tr><td style="padding:14px 0;border-bottom:1px solid #E4DDD3"><strong>${escapeHtml(item.product_name)}</strong>${variant ? `<div style="color:#6E685F;font-size:13px;margin-top:4px">${variant}</div>` : ""}<div style="color:#6E685F;font-size:13px;margin-top:4px">${escapeHtml(quantity)}</div></td><td style="padding:14px 0;border-bottom:1px solid #E4DDD3;text-align:right;white-space:nowrap">${escapeHtml(money(item.line_total))}</td></tr>`;
  }).join("");
}

export function emailShell(content: string) {
  return `<!doctype html><html><body style="margin:0;background:#F7F3ED;color:#1A1A1A;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:24px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#FFFFFF;border:1px solid #E4DDD3"><tr><td style="padding:28px 32px;border-bottom:3px solid #C7A66A;text-align:center;font-family:Georgia,serif;font-size:23px;letter-spacing:3px">QURZAIB FABRICS</td></tr><tr><td style="padding:32px">${content}</td></tr><tr><td style="padding:20px 32px;background:#1A1A1A;color:#FFFFFF;text-align:center;font-size:12px">Qurzaib Fabrics · Elegance Woven With Faith</td></tr></table></td></tr></table></body></html>`;
}
