import { CheckoutSchema, normalizeCheckoutItems } from "@/src/lib/validations/order";
import { createServiceClient } from "@/src/lib/supabase/service";
import { consumeRateLimit, getRequestIp, rateLimitExceededResponse } from "@/src/lib/security/rate-limit";
import { sendOrderEmails } from "@/src/lib/email/send-order-emails";

const MAX_BODY_BYTES = 32_768;
const isDevelopment = process.env.NODE_ENV !== "production";

type NormalizedCheckoutItem = ReturnType<typeof normalizeCheckoutItems>[number];

async function logNormalizedItems(
  serviceClient: ReturnType<typeof createServiceClient>,
  items: NormalizedCheckoutItem[]
) {
  if (!isDevelopment) return;

  const productIds = [...new Set(items.map((item) => item.product_id))];
  const { data, error } = await serviceClient
    .from("products")
    .select("id,product_type")
    .in("id", productIds);

  if (error) {
    console.error("Checkout normalized-item product-type lookup failed", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }

  const productTypes = new Map(
    (data ?? []).map((product) => [product.id, product.product_type])
  );

  console.info(
    "Checkout normalized items",
    items.map((item) => ({
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      quantity: item.quantity,
      product_type: productTypes.get(item.product_id) ?? "unavailable",
    }))
  );
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(
      request.headers.get("content-length") || "0"
    );

    if (contentLength > MAX_BODY_BYTES) {
      return Response.json(
        { message: "Invalid checkout request" },
        { status: 413 }
      );
    }

    const rawBody = await request.text();

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return Response.json(
        { message: "Invalid checkout request" },
        { status: 413 }
      );
    }

    let json;

    try {
      json = JSON.parse(rawBody);
    } catch {
      return Response.json(
        { message: "Invalid checkout request" },
        { status: 400 }
      );
    }

    const parsed = CheckoutSchema.safeParse(json);

    if (!parsed.success) {
      if (isDevelopment) {
        console.error(
          "Checkout rejected before create_atomic_order",
          parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            code: issue.code,
            message: issue.message,
          }))
        );
      }

      return Response.json(
        { message: "Invalid checkout request" },
        { status: 400 }
      );
    }

    // Rate-limit valid checkout attempts
    const rateLimit = 60;
    const rateWindow = 15 * 60_000;

    const ip = getRequestIp(request);

    const allowed = await consumeRateLimit(
      `checkout:${ip}`,
      rateLimit,
      rateWindow
    );

    if (!allowed) {
      return rateLimitExceededResponse(rateWindow);
    }

    let items;

    try {
      items = normalizeCheckoutItems(parsed.data.items);
    } catch (error) {
      if (isDevelopment) {
        console.error("Checkout item normalization failed before create_atomic_order", {
          message: error instanceof Error ? error.message : "Unknown normalization error",
        });
      }

      return Response.json(
        { message: "Invalid checkout request" },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    await logNormalizedItems(serviceClient, items);
    const { data, error } =
      await serviceClient.rpc(
        "create_atomic_order",
        {
          p_customer_name:
            parsed.data.customer_name,

          p_email:
            parsed.data.email,

          p_phone_number:
            parsed.data.phone_number,

          p_delivery_address:
            parsed.data.delivery_address,

          p_address_line_2:
            parsed.data.address_line_2,

          p_area:
            parsed.data.area,

          p_city:
            parsed.data.city,

          p_province:
            parsed.data.province,

          p_postal_code:
            parsed.data.postal_code,

          p_delivery_notes:
            parsed.data.delivery_notes,

          p_payment_method:
            parsed.data.payment_method,

          p_idempotency_key:
            parsed.data.idempotency_key,

          p_items:
            items,
        }
      );

    if (error || !data?.[0]) {
      if (isDevelopment) {
        console.error("Checkout create_atomic_order RPC failed", {
          message: error?.message ?? "RPC returned no order",
          code: error?.code ?? null,
          details: error?.details ?? null,
          hint: error?.hint ?? null,
        });
      }

      const message =
        error?.message?.includes("OUT_OF_STOCK")
          ? "One or more items are out of stock"
          : error?.message?.includes(
                "INVALID_PRODUCT"
              ) ||
              error?.message?.includes(
                "INVALID_VARIANT"
              )
            ? "One or more items are unavailable"
            : "Unable to place order";

      return Response.json(
        { message },
        { status: 400 }
      );
    }

    // The order transaction is already committed. Email failures are tracked
    // independently and must never turn a valid order into a checkout failure.
    const emailResult = await sendOrderEmails(serviceClient, data[0].order_id);

    return Response.json({
      success: true,
      orderReference:
        data[0].public_order_id,
      total:
        data[0].total_amount,
      deliveryCharges:
        data[0].delivery_charges,
      paymentStatus:
        data[0].payment_status,
      orderStatus:
        data[0].order_status,
      customerEmailAccepted: emailResult.customerEmailAccepted,
      emailStatus: emailResult.emailStatus,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    return Response.json(
      { message: "Unable to place order" },
      { status: 500 }
    );
  }
}
