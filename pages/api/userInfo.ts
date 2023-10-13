import type { NextRequest } from "next/server";
import { projectId } from "../../utils/sessionkey";

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

  return new Response(
    JSON.stringify({
      // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
      uuid: crypto.randomUUID(),
      // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
      randomValues: crypto.getRandomValues(new Uint32Array(10)),
      plainText,
      fromMiddleware,
      projectId,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
