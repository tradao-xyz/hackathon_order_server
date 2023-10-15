import type { NextRequest } from "next/server";
import { projectId } from "../../src/utils/sessionkey";
import { selectUserInfo } from "../../src/utils/user";
import { sendTelegramResponse } from "../../src/utils/botLib";

// ------------------
// Using Crypto with Edge Middleware and Edge Functions
// ------------------

export const config = {
  runtime: "edge",
};

export default async function getUserInfo(request: NextRequest) {
  const url = request.nextUrl;
  const tgId = Number(url.searchParams.get("tgId"));

  const userInfo = await selectUserInfo(tgId);
  if (!userInfo || !userInfo.scw || !userInfo.sessionKey) {
    //1. generate verificationCode
    const u32a = new Uint32Array(1);
    const verificationCode = crypto.getRandomValues(u32a)[0];
    //2. lead to binding...
    const msg = `🤖 Hey ${tgId}, click below to get your smart wallet! \n\n\n  [Get new Wallet](https://aa.tradao.xyz/build?tgId=123&publicKey=0x123&verificationCode=abc) `;
    return await sendTelegramResponse(
      tgId,
      msg,
      process.env.TELEGRAM_BOT_TOKEN
    );
  } else {
    return new Response(
      JSON.stringify({
        tgId,
        userInfo,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
