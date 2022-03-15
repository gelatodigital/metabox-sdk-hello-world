# Gelato MetaBox SDK Hello World

Send Hello World transactions using Gelato MetaBox SDK
<br/><br/>

## Prerequisite

- Check [metabox-sdk](https://www.npmjs.com/package/@gelatonetwork/metabox-sdk) npm package page to know more about how to use the Gelato's MetaBox relayer
  <br/><br/>

## How to use

1. Install project dependencies:

```
yarn install
```

2. Create a `.env` file to use on `mumbai` network:

```
CHAIN_ID=80001
PROVIDER_URL="https://rpc-mumbai.maticvigil.com/"
USER_PK=""
SPONSOR_PK=""
```

- `USER_PK` refers to private key of the Hello World application user.

- `SPONSOR_PK` refers to the EOA that will pay transaction fee. Can be same as `USER_PK`.
  Note: On testnets like `mumbai` Gelato will pay transaction fees.
  But on production networks `SPONSOR` is expected to already hold a balance with Gelato.

## Examples

## 1. Send a transaction using MetaBox SDK

- First, use `MetaBoxSDK.isChainSupported` to verify that your network is supported by Gelato MetaBox:

```ts
if (!process.env.CHAIN_ID) {
  throw new Error("chainId is missing");
}

const chainId = parseInt(process.env.CHAIN_ID);
const isChainSupported = await MetaBoxSDK.isChainSupported(chainId);
if (!isChainSupported) {
  console.log("ChainId not supported");
  return;
}
```

- Then, use `MetaBoxSDK.metaBoxRequest` to build the necessary data to be signed and submitted:

```ts
// address of HelloWorld's user (may be same EOA as sponsor)
const userAddress = await user.getAddress();

const { address, abi } = MetaBoxSDK.getMetaBoxAddressAndABI(chainId);
const gelatoMetaBox = new Contract(address, abi, provider);
// user's smart contract nonce (to prevent replay attacks)
const nonce: number = parseInt(await gelatoMetaBox.nonce(userAddress));
// HelloWorld uses EIP-2771 for compatability with meta transactions:
// msg.sender will safely be interpreted as userAddress
const isEIP2771 = true;

const request = MetaBoxSDK.metaBoxRequest(
  chainId,
  // target contract to call
  HELLO_WORLD,
  data,
  // feeToken
  ETH,
  userAddress,
  nonce,
  isEIP2771
);
```

- Compute `digest` by hashing request data, and then sign with each private key to
  produce `userSignature` and `sponsorSignature`:

```ts
// Distill request data into a hash
const digest = MetaBoxSDK.getDigestToSign(request);

// user signs digest
const userSignature = utils.joinSignature(
  await user._signingKey().signDigest(digest)
);

// sponsor signs digest
// Sponsor commits to paying transaction fee
// by having its balance deducted from Gelato Diamond SponsorFacet
let sponsorSignature: string | undefined = undefined;
if (sponsorPK && sponsorPK.length > 0) {
  const sponsor = new Wallet(sponsorPK);

  sponsorSignature = utils.joinSignature(
    await sponsor._signingKey().signDigest(digest)
  );
}
```

### Note: This is NOT the recommended way of obtaining `userSignature` for UI users!

### Only useful for illustration purposes.

If `user` is interacting with a UI using a wallet,
consider using `MetaBoxSDK.getWalletPayloadToSign(request)`,
and then call rpc method `eth_signTypedData_v4` to get `userSignature`.

- Finally, use `MetaBoxSDK.sendMetaBoxTransaction` to send transaction payload to Gelato MetaBox relayer:

```ts
const taskId = await MetaBoxSDK.sendMetaBoxTransaction(
  request,
  userSignature,
  sponsorSignature
);
```

Check this [`transaction`](https://mumbai.polygonscan.com/tx/0xd13a21ac99ec37ff222ba462eee87cca30fe34f4b9d43e5e2459d3615b1fcc58#eventlog) for an example. Notice how the user address is not `msg.sender` but rather `request.user`, due to the fact that `req.isEIP2771` was set as `true`.

By inheriting the [`ERC2771Context`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/metatx/ERC2771Context.sol) contract as we did in [`HelloWorld`](./contracts/HelloWorld.sol), and replacing all occurrences of `msg.sender` by `_msgSender()`, dApps can ensure that GelatoMetaBox safely passes on the original user's address whenever required.
Alternatively, for dApps whose logic does not rely on who `msg.sender` or `_msgSender()` is, `request.isEIP2771` should be set as `false` and no smart contract changes are required.

- Check the example source code [`send-tx.ts`](./send-tx.ts) and try it yourself using:

```
yarn send-tx
```
