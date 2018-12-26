var Auction = artifacts.require("Auction");

module.exports = function(deployer) {
  deployer.deploy(Auction,"",0,"0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000",false);
};