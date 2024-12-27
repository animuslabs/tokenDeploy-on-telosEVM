// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@layerzerolabs/oft-evm/contracts/OFT.sol";

contract TokenContract is OFT {
    event Debug(string message, address value);
    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate,
        address _initialOwner
    )
        OFT(_name, _symbol, _lzEndpoint, _delegate)
        Ownable(_initialOwner)
    {
        emit Debug("Delegate Address", _delegate);
        emit Debug("Initial Owner", _initialOwner);
        transferOwnership(_initialOwner);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
