var SASIToken = artifacts.require("./SASIToken.sol");

module.exports = function (deployer) {
  deployer.deploy(SASIToken);
};