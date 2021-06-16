pragma solidity ^0.5.16;

contract SASIToken {
	string  public name   = "SASI Token"; // Token name
	string  public symbol = "SASI"; // Symbol
	string  public standard = "SASI Token v1.0"; // Declare totalSupply variable
	uint256 public totalSupply; // Declare totalSupply variable

	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
		);

	mapping(address => uint256) public balanceOf;	

	constructor (uint256 _initialSupply) public {   // Token constructor
		balanceOf[msg.sender] = _initialSupply;		// allocate initial supply
		totalSupply = _initialSupply;

	}

	// Transfer function 
	function transfer(address _to, uint256 _value) public returns (bool success) {
	// Exception incase of insufficient balance
	require(balanceOf[msg.sender] >= _value);

	// Transfer the balance
	balanceOf[msg.sender] -= _value;
	balanceOf[_to] += _value;

	// Transfer Event
	emit Transfer(msg.sender, _to, _value);
	
	// Return a Boolean
	return true;

	}

}


