/* eslint-disable @typescript-eslint/naming-convention */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAddressBookByNetwork = (chainId: number) => {
  switch (chainId) {
    case 5:
      return {
        GELATO: "0x683913B3A32ada4F8100458A3E1675425BdAa7DF",
        GELATO_META_BOX: "0x6be602e1E1629789E64bf30d56139396b232597C",
        HELLO_WORLD: "0xF78f9cd554d75EABd565e7866833b6642342D225",
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      };
    case 137:
      return {
        GELATO: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        GELATO_META_BOX: "0xbeC333EDE1A0687D2b9624F8C073a54c93ba9777",
        HELLO_WORLD: "0x2caD01dE572e00af828e5FB02EBf9821f03eD8f0",
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      };
    case 80001:
      return {
        GELATO: "0x69623a227Cf0aFF37C3c60f5cd74bfed04377c79",
        GELATO_META_BOX: "0xeeea839E2435873adA11d5dD4CAE6032742C0445",
        HELLO_WORLD: "0x3F9BBfb21E666914a5ab195C1CE02c4365A85aA5",
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      };

    default: {
      throw new Error(`addressBooks: chainId: ${chainId} not supported`);
    }
  }
};
