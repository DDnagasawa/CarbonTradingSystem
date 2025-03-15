require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // 用于加载 .env 文件中的环境变量

// 调试：打印环境变量
console.log("Debug: INFURA_URL =", process.env.INFURA_URL);
console.log("Debug: PRIVATE_KEY =", process.env.PRIVATE_KEY);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20", // 指定 Solidity 编译器版本
  networks: {
    sepolia: {
      url: process.env.INFURA_URL || "", // 确保环境变量存在，否则为空字符串
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [], // 如果私钥不存在，返回空数组
    },
  },
};