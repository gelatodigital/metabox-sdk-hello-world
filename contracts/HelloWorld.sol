// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/// @title HelloWorld with meta transaction support (EIP-2771)
contract HelloWorld is ERC2771Context {
    event Success(
        address indexed user,
        address indexed feeToken,
        string message
    );

    // solhint-disable-next-line no-empty-blocks
    constructor(address _gelatoMetaBox) ERC2771Context(_gelatoMetaBox) {}

    function sayHi(address _feeToken) external {
        string memory message = "Hello World!";

        emit Success(_msgSender(), _feeToken, message);
    }
}
