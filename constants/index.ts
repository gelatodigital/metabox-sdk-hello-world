/* eslint-disable @typescript-eslint/naming-convention */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAddressBookByNetwork = (chainId: number) => {
  switch (chainId) {
    case 5:
      return {
        HELLO_WORLD: "0xF78f9cd554d75EABd565e7866833b6642342D225",
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      };
    case 137:
      return {
        HELLO_WORLD: "0x2caD01dE572e00af828e5FB02EBf9821f03eD8f0",
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      };
    case 80001:
      return {
        HELLO_WORLD: "0x3F9BBfb21E666914a5ab195C1CE02c4365A85aA5",
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      };

    default: {
      throw new Error(`addressBooks: chainId: ${chainId} not supported`);
    }
  }
};
