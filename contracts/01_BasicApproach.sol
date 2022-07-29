
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Kiftables/Kiftables.sol";
// import "hardhat/console.sol";           // for debuggings

contract KiftablesPerkFiftyOff {
    Kiftables public kiftables;
    mapping(uint256 => bool) public redeemedPerks;

    constructor(address _kiftablesAddress) {
        kiftables = Kiftables(_kiftablesAddress);
    }

    function redeemPerk(uint256 tokenId) public {
        address tokenOwner = kiftables.ownerOf(tokenId);
        require(
            tokenOwner == msg.sender,
            "Cannot redeem perk for token you dont own"
        );
        redeemedPerks[tokenId] = true;
    }
}
