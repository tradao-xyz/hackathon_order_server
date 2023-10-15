import type { NextRequest } from "next/server";
import { insertBinding } from "../../src/utils/dbHelper";
import { getAddress } from "viem";

// ------------------
// Using Crypto with Edge Middleware and Edge Functions
// ------------------

export const config = {
  runtime: "edge",
};

export default async function binding(request: NextRequest) {
  const url = request.nextUrl;
  const b = request.json();
  //todo post
  const tgId = Number(url.searchParams.get("tgId"));
  const scw = url.searchParams.get("scw");
  const serializeSessionKeyParams = url.searchParams.get(
    "serializeSessionKeyParams"
  );
  const verificationCode = url.searchParams.get("verificationCode");

  if (serializeSessionKeyParams.length < 10) {
    return new Response(
      JSON.stringify({ ok: false, msg: `invalid sessionKey` }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  await insertBinding(tgId, serializeSessionKeyParams, getAddress(scw));

  return new Response(
    JSON.stringify({
      ok: true,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
