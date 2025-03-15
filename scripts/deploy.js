// 引入 Hardhat 的运行时环境（hre），用于与 Hardhat 提供的工具交互
const hre = require("hardhat");

async function main() {
  // 获取部署者的账户信息（通过 ethers.js 提供的 `getSigners` 方法）
  const [deployer] = await hre.ethers.getSigners();

  // 打印部署者的钱包地址
  console.log("Deploying contract with the account:", deployer.address);

  // 打印部署者的账户余额（单位为 ETH），确保部署者账户中有足够的资金
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // 获取当前网络的名称（例如 goerli, mainnet 等）
  const network = hre.network.name;
  console.log("Deploying to network:", network);

  // 获取合约工厂，这里需要替换为你的合约名称 "CarbonTrader"
  // 合约工厂是用于部署合约的抽象对象
  const CarbonTrader = await hre.ethers.getContractFactory("CarbonTrader");

  // 设置构造函数需要的参数（替换为你的参数值）
  // 这里是 USDT 合约地址，作为示例值
  const usdtTokenAddress = process.env.USDT_TOKEN_ADDRESS || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  console.log("USDT Token Address:", usdtTokenAddress);

  // 开始部署合约
  console.log("Deploying CarbonTrader contract...");
  const carbonTrader = await CarbonTrader.deploy(usdtTokenAddress); // 传入构造函数参数

  // 打印部署的交易哈希，用于追踪部署交易
  console.log("Deployment transaction hash:", carbonTrader.deployTransaction.hash);

  // 等待部署完成（等待区块确认）
  console.log("Waiting for deployment confirmation...");
  await carbonTrader.deployed();

  // 打印合约部署地址
  console.log("CarbonTrader contract deployed at:", carbonTrader.address);
}

// 主函数调用入口
main()
  .then(() => process.exit(0)) // 如果主函数成功执行，退出程序，返回状态码 0
  .catch((error) => {
    // 捕获任何错误并打印
    console.error("Error during deployment:", error);
    process.exitCode = 1; // 如果发生错误，返回状态码 1
  });