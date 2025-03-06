import { ethers } from "hardhat";

async function main() {
  const OpenInnovation = await ethers.getContractFactory("OpenInnovation");
  const openInnovation = await OpenInnovation.deploy();
  await openInnovation.deployed();

  console.log(`OpenInnovation deployed to ${openInnovation.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});