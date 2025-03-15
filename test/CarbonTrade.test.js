const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonTrader Contract", function () {
  let mockToken, carbonTrader;
  let owner, addr1, addr2;

  beforeEach(async function () {
    // Ethers v6 中：签名者没有 .address，而要用 await signer.getAddress()
    [owner, addr1, addr2] = await ethers.getSigners();

    // 1. 部署 MockToken
    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    mockToken = await MockTokenFactory.deploy();
    // Ethers v6 不再需要 mockToken.deployed()

    // 2. 部署 CarbonTrader，把 mockToken 的地址传进构造函数
    const mockTokenAddress = await mockToken.getAddress();
    const CarbonTraderFactory = await ethers.getContractFactory("CarbonTrader");
    carbonTrader = await CarbonTraderFactory.deploy(mockTokenAddress);
  });

  it("Should set the right owner", async function () {
    // Ethers v6：不能用 owner.address，需:
    expect(await carbonTrader.getOwner()).to.equal(await owner.getAddress());
  });

  it("Should deposit tokens successfully", async function () {
    // 1. owner 转 1000 Tokens 给 addr1
    const amountToAddr1 = ethers.parseUnits("1000", 18);
    await mockToken.transfer(await addr1.getAddress(), amountToAddr1);

    // 2. addr1 授权 CarbonTrader 500
    const depositAmount = ethers.parseUnits("500", 18);
    await mockToken
      .connect(addr1)
      .approve(await carbonTrader.getAddress(), depositAmount);

    // 3. 调用 deposit
    await carbonTrader
      .connect(addr1)
      .deposit("trade-1", depositAmount, "info for trade-1");

    // 4. 检查 CarbonTrader 中的余额
    const carbonTraderBalance = await mockToken.balanceOf(await carbonTrader.getAddress());
    expect(carbonTraderBalance).to.equal(depositAmount);
  });

  it("Should refund deposit successfully", async function () {
    // 1. owner -> addr1: 1000
    const initialAmount = ethers.parseUnits("1000", 18);
    await mockToken.transfer(await addr1.getAddress(), initialAmount);

    // 2. approve + deposit
    const depositAmount = ethers.parseUnits("500", 18);
    await mockToken
      .connect(addr1)
      .approve(await carbonTrader.getAddress(), depositAmount);

    await carbonTrader
      .connect(addr1)
      .deposit("trade-2", depositAmount, "info for trade-2");

    // CarbonTrader 余额应为 500
    expect(await mockToken.balanceOf(await carbonTrader.getAddress())).to.equal(
      depositAmount
    );

    // 3. refund
    await carbonTrader.connect(addr1).refundDeposit("trade-2");

    // 4. 退回后 CarbonTrader 余额应为 0
    expect(await mockToken.balanceOf(await carbonTrader.getAddress())).to.equal(0);

    // 5. addr1 应回到 1000
    const addr1Balance = await mockToken.balanceOf(await addr1.getAddress());
    expect(addr1Balance).to.equal(initialAmount);
  });
});