import type { NextRequest, NextResponse } from "next/server";
import { insertBinding } from "../../src/utils/dbHelper";
import { getAddress } from "viem";

export const config = {
  runtime: "edge",
};

export default async function handler(request: NextRequest, res: NextResponse) {
  interface BindingParams {
    tgId: number;
    scw: string;
    serializeSessionKeyParams: string;
    verificationCode: string;
  }

  const b: BindingParams = await request.json();
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
