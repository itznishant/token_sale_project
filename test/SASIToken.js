var SASIToken = artifacts.require("./SASIToken.sol");

contract('SASIToken' , function(accounts) {

	it("sets the token supply on deployment", function() {
		return SASIToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 1000000, "sets totalSupply to 1 Million (10,00,000)");
		});
	});
})