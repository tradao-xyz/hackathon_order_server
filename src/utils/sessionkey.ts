import { LocalAccountSigner } from "@alchemy/aa-core";
import { generatePrivateKey } from "viem/accounts";
import {
  ECDSAProvider,
  EmptyAccountSigner,
  Operation,
  ParamCondition,
  SessionKeyProvider,
} from "@zerodev/sdk";
import {
  Hex,
  encodeFunctionData,
  getFunctionSelector,
  pad,
  parseAbi,
  zeroAddress,
} from "viem";

// ------------------
// Using Crypto with Edge Middleware and Edge Functions
// ------------------

export const projectId = "0864346d-c650-4383-830b-35bdfd2fa5be";

const gmxv1TermsOfService = "0xabbc5f99639c9b6bcb58544ddf04efa6802f4064";
const gmxv1RouterAddress = "0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868";
const arbiUsdcAddress = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";

const sessionPrivateKey: Hex = "0x4ef084DD03A58497Dd549266b51BeE274C3b420F";

const contractABI = parseAbi([
  "function approvePlugin(address _plugin) external",
]);

export async function sendUO(sessionKeyProvider: SessionKeyProvider) {
  const { hash } = await sessionKeyProvider.sendUserOperation([
    {
      target: gmxv1TermsOfService,
      data: encodeFunctionData({
        abi: contractABI,
        functionName: "approvePlugin",
        args: [gmxv1RouterAddress],
      }),
    },
  ]);

  await sessionKeyProvider.waitForUserOperationTransaction(hash as Hex);
}

export async function reconstructSessionKeyProvider(serializedSessionKey: Hex) {
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
          target: gmxv1TermsOfService,
          // Maximum value that can be transferred.  In this case we
          // set it to zero so that no value transfer is possible.
          valueLimit: 0n,
          // The function (as specified with a selector) that can be called on
          sig: getFunctionSelector("approvePlugin(address _plugin) external"), //todo
          // Whether you'd like to call this function via CALL or DELEGATECALL.
          // DELEGATECALL is dangerous -- don't use it unless you know what you
          // are doing.
          operation: Operation.Call,
          // Each "rule" is a condition on a parameter.  In this case, we only
          // allow for minting NFTs to our own account.
          rules: [],
        },
        {
          // Target contract to interact with
          target: arbiUsdcAddress,
          // Maximum value that can be transferred.  In this case we
          // set it to zero so that no value transfer is possible.
          valueLimit: 0n,
          // The function (as specified with a selector) that can be called on
          sig: getFunctionSelector("approve(address spender, uint256 amount)"), //todo
          // Whether you'd like to call this function via CALL or DELEGATECALL.
          // DELEGATECALL is dangerous -- don't use it unless you know what you
          // are doing.
          operation: Operation.Call,
          // Each "rule" is a condition on a parameter.  In this case, we only
          // allow for minting NFTs to our own account.
          rules: [
            {
              // The condition in this case is "EQUAL"
              condition: ParamCondition.EQUAL,
              // The offset of the parameter is 0 since it's the first parameter.
              // We will simplify this later.
              offset: 0,
              // We pad the address to be the correct size.
              // We will simplify this later.
              param: pad("0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868", {
                size: 32,
              }),
            },
          ],
        },
        {
          // Target contract to interact with
          target: gmxv1RouterAddress,
          // Maximum value that can be transferred.  In this case we
          // set it to zero so that no value transfer is possible.
          valueLimit: 1000000000000000000n,
          // The function (as specified with a selector) that can be called on
          sig: getFunctionSelector(
            "createIncreasePosition(address[] _path,address _indexToken,uint256 _amountIn,uint256 _minOut,uint256 _sizeDelta,bool _isLong,uint256 _acceptablePrice,uint256 _executionFee,bytes32 _referralCode,address _callbackTarget)"
          ), //todo
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
