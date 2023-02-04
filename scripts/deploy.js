// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // const Counter = await hre.ethers.getContractFactory("Counter");
  // const deployed = await Counter.deploy();

  const Cinema = await hre.ethers.getContractFactory("Cinema");
  const Cinema_deployed = await Cinema.deploy();

  await Cinema_deployed.deployed();

  console.log("Cinema Contract deployed to:", Cinema_deployed.address);
  storeContractData(Cinema_deployed, "Cinema")

  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  const TicketNFT_deployed = await TicketNFT.deploy();

  await TicketNFT_deployed.deployed();

  console.log("TicketNft Contract deployed to:", TicketNFT_deployed.address);
  storeContractData(TicketNFT_deployed, "TicketNFT")
}

function storeContractData(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}Address.json`,
    JSON.stringify({ [name]: contract.address }, undefined, 2)
  );

  const Artifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(Artifact, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

