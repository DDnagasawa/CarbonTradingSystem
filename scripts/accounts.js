const hre = require("hardhat");

async function main() {
  // 获取所有可用的账户（signers）
  const signers = await hre.ethers.getSigners();

  // 打印账户地址列表
  console.log("Accounts:");
  signers.forEach((signer, index) => {
    console.log(`${index}: ${signer.address}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
  });