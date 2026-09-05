import "server-only";

import { createHash } from "node:crypto";

import { createServiceClient } from "@/src/lib/supabase/service";

export function getRequestIp(request: Request) {
  const trustedForwardedHeader = process.env.RATE_LIMIT_IP_HEADER?.toLowerCase();
  const platformHeader =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-real-ip");
  const configuredHeader = trustedForwardedHeader
    ? request.headers.get(trustedForwardedHeader)
    : null;
  const ip = (configuredHeader || platformHeader)?.split(",")[0]?.trim();

  if (ip) {
    return ip;
  }

  // Local development has no reverse-proxy IP headers.
  if (process.env.NODE_ENV !== "production") {
    return "local-development";
  }

  // Do not collapse every unidentifiable production request into one bucket.
  // This is a privacy-preserving fallback, not an authentication signal.
  const fingerprint = [
    request.headers.get("user-agent") || "no-user-agent",
    request.headers.get("accept-language") || "no-language",
    request.headers.get("accept-encoding") || "no-encoding",
  ].join("|");

  return `client-${createHash("sha256").update(fingerprint).digest("hex")}`;
}

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
) {
  // Don't use the distributed production limiter during local development.
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const keyHash = createHash("sha256")
    .update(key)
    .digest("hex");

  const { data, error } = await createServiceClient().rpc("consume_api_rate_limit",
      {
        p_key_hash: keyHash,
        p_limit: limit,
        p_window_seconds: Math.max(
          1,
          Math.ceil(windowMs / 1000)
        ),
      }
    );

  if (error) {
    console.error(
      "Distributed rate limiter unavailable",
      error
    );

    return false;
  }

  return data === true;
}
