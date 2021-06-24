var SASIToken = artifacts.require("./SASIToken.sol");
var SASITokenSale = artifacts.require("./SASITokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(SASIToken, 1000000).then(function() {
    // Token price is 0.001 Ether (ETH)
    var tokenPrice = 1000000000000000; // in WEI
    return deployer.deploy(SASITokenSale, SASIToken.address, tokenPrice);
  });
};
