import type { NextRequest } from "next/server";

// ------------------
// Using Crypto with Edge Middleware and Edge Functions
// ------------------

export const config = {
  runtime: "edge",
};

export default async function binding(request: NextRequest) {
  const url = request.nextUrl;
  const tgId = url.searchParams.get("tgId");
  const scw = url.searchParams.get("scw");
  const serializeSessionKeyParams = url.searchParams.get(
    "serializeSessionKeyParams"
  );
  const verificationCode = url.searchParams.get("verificationCode");

  return new Response(
    JSON.stringify({
      tgId,
      scw,
      serializeSessionKeyParams,
      verificationCode,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
