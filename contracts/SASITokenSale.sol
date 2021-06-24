pragma solidity ^0.5.16;

import "./SASIToken.sol";

contract SASITokenSale {
	address payable admin;
	SASIToken public tokenContract;
	uint256   public tokenPrice;
	uint256   public tokensSold;

	event Sell(address _buyer, uint256 _amount);

	constructor(SASIToken _tokenContract, uint256 _tokenPrice) public {
		admin = msg.sender;  				// Assign an admin
		tokenContract = _tokenContract; 	// Token Contract
		tokenPrice = _tokenPrice; 			// Token Price

	}
	
	function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

	function buyTokens(uint256 _numberOfTokens) public payable {
		// Require that value is equal to tokens
		require(msg.value == multiply(_numberOfTokens, tokenPrice));
		// Require that the contract has enough tokens
		require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);   // "this" is a reference to the smart contract itself
		// Require that a transfer is successful
		require(tokenContract.transfer(msg.sender, _numberOfTokens));
		// Keep track of tokens Sold
		tokensSold += _numberOfTokens;
		// Trigger Sell Event
		emit Sell(msg.sender, _numberOfTokens);
	}

	// Ending Token SASITokenSale

	function endSale() public {
		// Require only admin can end sale
		require(msg.sender == admin);
		// Transfer remaining SASItokens to admin
		require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
		
		// Destroy contract
		selfdestruct(admin);
	}
}