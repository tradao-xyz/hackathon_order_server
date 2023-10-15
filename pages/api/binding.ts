import type { NextRequest } from "next/server";
import { insertBinding } from "../../src/utils/dbHelper";
import { getAddress } from "viem";

// ------------------
// Using Crypto with Edge Middleware and Edge Functions
// ------------------

export const config = {
  runtime: "edge",
};

interface BindingParams {
  tgId: number;
  scw: string;
  serializeSessionKeyParams: string;
  verificationCode: string;
}

export default async function binding(request: NextRequest) {
  const url = request.nextUrl;
  const b: BindingParams = await request.json();
  //todo post
  const tgId = b.tgId;
  const scw = b.scw;
  const serializeSessionKeyParams = b.serializeSessionKeyParams;
  const verificationCode = b.verificationCode;

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
