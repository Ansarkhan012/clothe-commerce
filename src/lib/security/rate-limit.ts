import "server-only";

import { createHash } from "node:crypto";

import { createServiceClient } from "@/src/lib/supabase/service";

export function getRequestIp(request: Request) {
  const trustedForwardedHeader = process.env.RATE_LIMIT_IP_HEADER?.toLowerCase();
  const configuredHeader = trustedForwardedHeader
    ? request.headers.get(trustedForwardedHeader)
    : null;
  const platformHeader = process.env.VERCEL === "1"
    ? request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-real-ip")
    : process.env.CF_PAGES === "1"
      ? request.headers.get("cf-connecting-ip")
      : null;
  const ip = (configuredHeader || platformHeader)?.split(",")[0]?.trim();

  if (ip) {
    return ip;
  }

  // Local development has no reverse-proxy IP headers.
  if (process.env.NODE_ENV !== "production") {
    return "local-development";
  }

  // Do not collapse every unidentifiable production request  bucket.
  // This is a privacy-preserving fallback, not an authentication signal.
  const fingerprint = [
    request.headers.get("cookie") || "no-cookie",
    request.headers.get("user-agent") || "no-user-agent",
    request.headers.get("accept-language") || "no-language",
    request.headers.get("accept-encoding") || "no-encoding",
    request.headers.get("sec-ch-ua-platform") || "no-platform",
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

  try {
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
      console.error("Distributed rate limiter unavailable; request allowed", {
        code: error.code,
        message: error.message,
      });

      return true;
    }

    if (data !== true && data !== false) {
      console.error("Distributed rate limiter returned an invalid decision; request allowed");
      return true;
    }

    return data;
  } catch (error) {
    console.error("Distributed rate limiter failed unexpectedly; request allowed", {
      message: error instanceof Error ? error.message : "Unknown rate limiter error",
    });
    return true;
  }
}

export function rateLimitExceededResponse(windowMs: number) {
  return Response.json(
    { message: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, Math.ceil(windowMs / 1000))) },
    }
  );
}
