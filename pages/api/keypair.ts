import { LocalAccountSigner } from "@alchemy/aa-core";
import type { NextRequest } from "next/server";
import { generatePrivateKey } from "viem/accounts";

// ------------------
// Using Crypto with Edge Middleware and Edge Functions
// ------------------

export const config = {
  runtime: "edge",
};

export default async function createKeypair(request: NextRequest) {
  const [pubKey, privateKey] = await createKeyPair();

  return new Response(
    JSON.stringify({
      pubKey,
      privateKey,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}

async function createKeyPair() {
  const sessionPrivateKey = generatePrivateKey();
  const sessionKey =
    LocalAccountSigner.privateKeyToAccountSigner(sessionPrivateKey);
  const sessionPublicKey = await sessionKey.getAddress();

  return [sessionPublicKey, sessionPrivateKey];
}
