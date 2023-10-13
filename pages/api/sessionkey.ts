import type { NextRequest } from "next/server";
import { LocalAccountSigner } from "@alchemy/aa-core";
import { generatePrivateKey } from "viem/accounts";
import {
  ECDSAProvider,
  EmptyAccountSigner,
  Operation,
  SessionKeyProvider,
} from "@zerodev/sdk";
import {
  Hex,
  encodeFunctionData,
  getFunctionSelector,
  parseAbi,
  zeroAddress,
} from "viem";

// ------------------
// Using Crypto with Edge Middleware and Edge Functions
// ------------------

export const config = {
  runtime: "edge",
};

const projectId = "0864346d-c650-4383-830b-35bdfd2fa5be";

const gmxv2ExchangeRouterAddress = "0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8";

// const sessionPublicKey =
//   "0xc6973b771925cbad96047fc079c3cd83a3fac0890f7532fc81ccc587a2bc955d";
const sessionPrivateKey: Hex = "0x4ef084DD03A58497Dd549266b51BeE274C3b420F";

const contractABI = parseAbi([
  "function mint(address _to) public",
  "function balanceOf(address owner) external view returns (uint256 balance)",
]);

export default async function createSessionKey(request: NextRequest) {
  const url = request.nextUrl;
  const fromMiddleware = url.searchParams.get("token") ?? "unset";

  const plainText = "Hello createSessionKey 111!";
  const password = "hunter2";

  return new Response(
    JSON.stringify({
      // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
      uuid: crypto.randomUUID(),
      // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
      randomValues: crypto.getRandomValues(new Uint32Array(10)),
      plainText,
      password,
      fromMiddleware,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}

async function sendUO(sessionKeyProvider: SessionKeyProvider) {
  const { hash } = await sessionKeyProvider.sendUserOperation({
    target: gmxv2ExchangeRouterAddress,
    data: encodeFunctionData({
      abi: contractABI,
      functionName: "mint",
      args: ["0xabc"],
    }),
  });

  await sessionKeyProvider.waitForUserOperationTransaction(hash as Hex);
}

async function reconstructSessionKeyProvider(serializedSessionKey: Hex) {
  const sessionKeyParams = {
    ...SessionKeyProvider.deserializeSessionKeyParams(serializedSessionKey),
    sessionPrivateKey,
  };

  return await SessionKeyProvider.fromSessionKeyParams({
    projectId,
    sessionKeyParams,
  });
}

//do in frontend
async function buildSerializedSessionKeyParams(sessionPublicKey: Hex) {
  //fake user private key
  const userPrivateKey = generatePrivateKey();
  // The "owner" of the AA wallet, which in this case is a private key
  const owner = LocalAccountSigner.privateKeyToAccountSigner(userPrivateKey);
  // Create the AA wallet
  const ecdsaProvider = await ECDSAProvider.init({
    projectId,
    owner,
  });

  // Create an "empty signer" with the public key alone
  const sessionKey = new EmptyAccountSigner(sessionPublicKey);

  const sessionKeyProvider = await SessionKeyProvider.init({
    // ZeroDev project ID
    projectId,
    // The master signer
    defaultProvider: ecdsaProvider,
    // the session key (private key)
    sessionKey,
    // session key parameters
    sessionKeyData: {
      // The UNIX timestamp at which the session key becomes valid
      validAfter: 0,
      // The UNIX timestamp at which the session key becomes invalid
      validUntil: 0,
      // The permissions
      // Each permission can be considered a "rule" for interacting with a particular
      // contract/function.  To create a key that can interact with multiple
      // contracts/functions, set up one permission for each.
      permissions: [
        {
          // Target contract to interact with
          target: gmxv2ExchangeRouterAddress,
          // Maximum value that can be transferred.  In this case we
          // set it to zero so that no value transfer is possible.
          valueLimit: 1000000000000000000n,
          // The function (as specified with a selector) that can be called on
          sig: getFunctionSelector("createOrder() payable returns (bytes32)"), //todo
          // Whether you'd like to call this function via CALL or DELEGATECALL.
          // DELEGATECALL is dangerous -- don't use it unless you know what you
          // are doing.
          operation: Operation.Call,
          // Each "rule" is a condition on a parameter.  In this case, we only
          // allow for minting NFTs to our own account.
          rules: [],
        },
      ],
      // The "paymaster" param specifies whether the session key needs to
      // be used with a specific paymaster.
      // Without it, the holder of the session key can drain ETH from the
      // account by spamming transactions and wasting gas, so it's recommended
      // that you specify a trusted paymaster.
      //
      // address(0) means it's going to work with or without paymaster
      // address(1) works only with paymaster
      // address(paymaster) works only with the specified paymaster
      paymaster: zeroAddress,
    },
  });

  return await sessionKeyProvider.serializeSessionKeyParams();
}
