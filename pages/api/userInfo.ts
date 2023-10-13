import { LocalAccountSigner } from "@alchemy/aa-core";
import type { NextRequest } from "next/server";
import { generatePrivateKey } from "viem/accounts";

// ------------------
// Using Crypto with Edge Middleware and Edge Functions
// ------------------

export const config = {
  runtime: "edge",
};

export default async function getUserInfo(request: NextRequest) {
  const url = request.nextUrl;
  const fromMiddleware = url.searchParams.get("token") ?? "unset";

  const plainText = "Hello 3333!";

  const [pubKey, privateKey] = await createKeyPair();

  return new Response(
    JSON.stringify({
      // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
      uuid: crypto.randomUUID(),
      // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
      randomValues: crypto.getRandomValues(new Uint32Array(10)),
      plainText,
      fromMiddleware,
      // pubKey,
      // privateKey,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}

async function createKeyPair() {
  const sessionPrivateKey = generatePrivateKey();
  const sessionKey =
    LocalAccountSigner.privateKeyToAccountSigner(sessionPrivateKey);
  const sessionPublicKey = await sessionKey.getAddress();

  return [sessionPrivateKey, sessionPublicKey];
}
