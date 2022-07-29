
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Kiftables/Kiftables.sol";
import "hardhat/console.sol";           // for debuggings

contract KiftablesPerkFiftyOff {
    Kiftables public kiftables;
    mapping(uint256 => bool) public redeemedPerks;

    constructor(address _kiftablesAddress) {
        kiftables = Kiftables(_kiftablesAddress);
    }

    function redeemPerk(uint256 tokenId) public {
        // debug
        console.log("Redeeom contract deployed at %s", address(this));
        console.log("Redeeming perk for tokenId: %s by %s", tokenId, msg.sender );
        uint256 balance = kiftables.balanceOf(msg.sender);
        console.log("Balance: %s", balance);
        bool isActive = kiftables.isPublicSaleActive();
        console.log("Kiftables sale active: %s", isActive  );
        // end debug

        address tokenOwner = kiftables.ownerOf(tokenId);
        console.log("Token owner: %s", tokenOwner);
        require(
            tokenOwner == msg.sender,
            "Cannot redeem perk for token you dont own"
        );
        redeemedPerks[tokenId] = true;
    }
}
