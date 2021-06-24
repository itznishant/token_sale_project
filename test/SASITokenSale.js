var SASIToken 	  = artifacts.require("./SASIToken.sol");
var SASITokenSale = artifacts.require("./SASITokenSale.sol");

contract('SASITokenSale', function(accounts) {
	var tokenInstance;
	var tokenSaleInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var tokenPrice = 1000000000000000; 	// Token price is in WEI (0.001 ETH)
	var tokensAvailable = 750000;
	var numberOfTokens;

	it('initializes the contract with correct values', function() { 
		return SASITokenSale.deployed().then(function(instance) {
			tokenSaleInstance = instance;
			return tokenSaleInstance.address
		}).then(function(address) {
			assert.notEqual(address, 0x0, "has contract address");
			return tokenSaleInstance.tokenContract();		
		}).then(function(address) {
			assert.notEqual(address, 0x0, "has token contract address");
			return tokenSaleInstance.tokenPrice();
		}).then(function(price) {
			assert.equal(price, tokenPrice, "has the correct token price");
	});
});

	it('facilitates token buying' , function() {
		return SASIToken.deployed().then(function(instance) {
			// Grab token instance first
			tokenInstance = instance;
			return SASITokenSale.deployed();
		}).then(function(instance) {
			// Then take token sale instance
			tokenSaleInstance = instance;
			// Provision 75% of all tokens to tokenSaleContract
			return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
		}).then(function(receipt) {
			numberOfTokens = 10;
			return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice })	
		}).then(function(receipt) {	
			assert.equal(receipt.logs.length, 1, 'triggers one event');
      		assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
      		assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that bought the tokens');
      		assert.equal(receipt.logs[0].args._amount.toNumber(), numberOfTokens, 'logs the number of tokens bought');
			return tokenSaleInstance.tokensSold();
		}).then(function(amount) {
			assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
			return tokenInstance.balanceOf(buyer);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), numberOfTokens)
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function(balance) {
			assert.equal(balance.toNumber() , tokensAvailable - numberOfTokens );
			// Try to buy tokens different than the ether value
			return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.toString().indexOf("revert") >= 0, 'msg.value must equal number of tokens in WEI');
			return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice })
		}).then(assert.fail).catch(function(error) {
			// console.log(error.message)
			assert(error.message.toString().indexOf("revert") >= 0, 'cannot buy more tokens than available');
		});
	});

	it('ends token sale' , function() {
		return SASIToken.deployed().then(function(instance) {
			// Grab token instance first
			tokenInstance = instance;
			return SASITokenSale.deployed();
		}).then(function(instance) {
			// Then take token sale instance
			tokenSaleInstance = instance;
			// Try to end sale from account who is not admin
			return tokenSaleInstance.endSale({ from: buyer });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.toString().indexOf("revert") >= 0, 'only admin must end sale');
			return tokenSaleInstance.endSale({ from: admin });
		}).then(function(receipt) {
			// Receipt
			return tokenInstance.balanceOf(admin);
		}).then(function(balance) {
			assert.equal(balance.toNumber() , 999990,  'returns all unsold tokens to admin' );	
			// Test if tokenPrice was reset when self destruct was called
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 0 , 'token price was reset');
		});
	});
 });