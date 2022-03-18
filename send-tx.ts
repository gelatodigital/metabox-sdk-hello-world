import { MetaBoxSDK } from "@gelatonetwork/metabox-sdk";
import helloWorldAbi from "./contracts/abis/HelloWorld.json";
import { getAddressBookByNetwork } from "./constants";
import { Wallet, Contract, utils, providers } from "ethers";

// Process Env Variables
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

async function main() {
  // Verify that current network is supported by Gelato MetaBox
  if (!process.env.CHAIN_ID) {
    throw new Error("chainId is missing");
  }

  const chainId = parseInt(process.env.CHAIN_ID);
  const isChainSupported = await MetaBoxSDK.isChainSupported(chainId);
  if (!isChainSupported) {
    console.log("ChainId not supported");
    return;
  }

  const { ETH, HELLO_WORLD } = getAddressBookByNetwork(chainId);

  // retrieve whitelisted payment tokens
  // sponsor can hold a balance with Gelato in any of those
  const feeTokens = await MetaBoxSDK.getFeeTokens(chainId);

  console.log(`Payment tokens accepted by Gelato: ${feeTokens}`);

  const userPK = process.env.USER_PK;

  let user: Wallet;

  if (userPK && userPK.length > 0) {
    user = new Wallet(userPK);
  } else {
    throw new Error("USER_PK invalid or missing");
  }
  // EOA that will pay transaction fee
  // On testnets Gelato will subsidize all payments
  // But on production networks sponsor is expected to hold a balance with Gelato Diamond SponsorFacet
  const sponsorPK = process.env.SPONSOR_PK;

  const provider = new providers.JsonRpcProvider(process.env.PROVIDER_URL);

  const helloWorld = new Contract(HELLO_WORLD, helloWorldAbi, provider);
  // Encode our HelloWorld.sayHi function call
  const data = helloWorld.interface.encodeFunctionData("sayHi", [ETH]);

  // Build MetaBox relay request object

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

  // Distill request data into a hash
  const digest = MetaBoxSDK.getDigestToSign(request);

  // user signs digest
  // Note: This is not the recommended way of having a dApp user signing a message.
  // Only useful for illustration purposes
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

  // Send tx to Gelato MetaBox relayer
  console.log(`Sending Hello World tx to Gelato MetaBox...`);
  console.log(`Request: `, request);
  console.log(`userSignature: `, userSignature);
  console.log(`sponsorSignature: `, sponsorSignature);

  const taskId = await MetaBoxSDK.sendMetaBoxTransaction(
    request,
    userSignature,
    sponsorSignature
  );

  console.log(`MetaBox Transaction Id: ${taskId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
