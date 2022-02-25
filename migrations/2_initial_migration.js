const ERC19 = artifacts.require("ERC19");

module.exports = function (deployer) {
  deployer.deploy(ERC19, {from: '0xc3F064CbFDBf76673051B24f9BFB62fd211E6DCa'});
};
