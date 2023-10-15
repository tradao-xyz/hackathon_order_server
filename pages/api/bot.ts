import type { NextRequest } from "next/server";

// ------------------
// Using Crypto with Edge Middleware and Edge Functions
// ------------------

export const config = {
  runtime: "edge",
};

export default async function chat(request: NextRequest) {
  return new Response(
    JSON.stringify({
      ok: true,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
