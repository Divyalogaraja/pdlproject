const hre = require("hardhat");

async function main() {
  console.log("Deploying DeltaCRegistry smart contract...");
  const DeltaCRegistry = await hre.ethers.getContractFactory("DeltaCRegistry");
  const registry = await DeltaCRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`DeltaCRegistry deployed successfully to: ${address}`);
  console.log(`Deployer address: ${(await hre.ethers.getSigners())[0].address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
