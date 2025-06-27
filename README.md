# Carbon Trading System

A blockchain-based carbon trading system featuring smart contracts, a Go backend API, and a React frontend. It supports carbon allowance issuance, freezing, destruction, auction, deposit management, and settlement.

---

## Directory Structure

```
CarbonTradingSystem/
├── contracts/                # Solidity smart contracts
│   ├── CarbonTrader.sol      # Main carbon trading contract
│   └── MockToken.sol        # ERC20 token for testing
├── scripts/                  # Hardhat scripts (deploy, accounts, etc.)
├── test/                     # Contract test cases
├── carbon-trading-backend/   # Go backend API service
├── carbon-trading-frontend/  # React frontend
├── hardhat.config.js         # Hardhat config
└── README.md                 # Project documentation
```

---

## Tech Stack

- **Smart Contract**: Solidity 0.8.x, OpenZeppelin Contracts, Hardhat
- **Backend**: Go 1.23+, Gin Web Framework, GORM, MySQL
- **Frontend**: React 19, ethers.js 6, Tailwind CSS

---

## Main Features

### Smart Contract (Solidity)
- **Carbon Allowance Management**: Issue, freeze, unfreeze, destroy allowances
- **Auction Mechanism**: Start carbon allowance auctions, support deposit, sealed bid, and settlement
- **Deposit Management**: Deposit and refund
- **Settlement & Withdrawal**: Settle and withdraw after auction
- **Contract Testing**: Covers core flows like allowance, deposit, refund, etc.

### Backend (Go + Gin + GORM)
- **API Service**: Provides trading-related RESTful APIs
- **Database**: MySQL for trade info storage
- **CORS Support**: Allows frontend cross-origin access

### Frontend (React + ethers.js)
- **User Interface**: Start trade, deposit management, bidding, settlement, etc.
- **Backend API Interaction**: Communicates with backend via RESTful API
- **Contract Interaction**: Interacts with blockchain contracts via ethers.js

---

## Quick Start

### 1. Install Dependencies

#### Contract & Scripts
```bash
npm install
```

#### Backend
```bash
cd carbon-trading-backend
go mod tidy
```

#### Frontend
```bash
cd carbon-trading-frontend
npm install
```

---

### 2. Database Config

The backend uses MySQL by default. Connection info is in `carbon-trading-backend/config/db.go`:
```
dsn := "root:12345678@tcp(127.0.0.1:3306)/carbontra?charset=utf8mb4&parseTime=True&loc=Local"
```
Make sure MySQL is running locally and the `carbontra` database is created.

---

### 3. Contract Deployment & Test

#### Compile Contracts
```bash
npx hardhat compile
```

#### Run Tests
```bash
npx hardhat test
```

#### Deploy Contract
Edit `.env` to set `INFURA_URL`, `PRIVATE_KEY`, and optionally `USDT_TOKEN_ADDRESS` (or use MockToken):
```env
INFURA_URL=your Infura node URL
PRIVATE_KEY=your wallet private key
USDT_TOKEN_ADDRESS=your USDT contract address (optional)
```
Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

### 4. Start Backend Service

```bash
cd carbon-trading-backend
go run main.go
```
(Default port: 8000)

---

### 5. Start Frontend

```bash
cd carbon-trading-frontend
npm start
```
Frontend runs at [http://localhost:3000](http://localhost:3000)

---

## Backend API

- `POST /api/trades`  Create trade
- `GET /api/trades`   Get all trades

See `carbon-trading-backend/controllers/trade.go` for request/response formats.

---

## Main Contract Interfaces (CarbonTrader.sol)
- `issueAllowance(address user, uint256 amount)` Issue carbon allowance
- `freezeAllowance(address user, uint256 amount)` Freeze allowance
- `unfreezeAllowance(address user, uint256 amount)` Unfreeze allowance
- `destroyAllowance(address user, uint256 amount)` Destroy allowance
- `startTrade(...)` Start auction
- `deposit(tradeID, amount, info)` Deposit
- `refundDeposit(tradeID)` Refund deposit
- `finalizeAuctionAndTransferCarbon(...)` Settle and transfer allowance
- `withdrawAuctionAmount()` Seller withdraw

---

# 中文说明

一个基于区块链的碳交易系统，包含智能合约、Go后端API和React前端，实现碳配额的发行、冻结、销毁、竞拍、保证金管理和结算等功能。

---

## 目录结构

```
CarbonTradingSystem/
├── contracts/                # Solidity智能合约源码
│   ├── CarbonTrader.sol      # 主碳交易合约
│   └── MockToken.sol        # 测试用ERC20 Token
├── scripts/                  # Hardhat脚本（部署、账户等）
├── test/                     # 合约测试用例
├── carbon-trading-backend/   # Go后端API服务
├── carbon-trading-frontend/  # React前端
├── hardhat.config.js         # Hardhat配置
└── README.md                 # 项目说明
```

---

## 技术栈

- **智能合约**：Solidity 0.8.x，OpenZeppelin Contracts，Hardhat
- **后端**：Go 1.23+，Gin Web Framework，GORM，MySQL
- **前端**：React 19，ethers.js 6，Tailwind CSS

---

## 主要功能

### 智能合约（Solidity）
- **碳配额管理**：发行、冻结、解冻、销毁碳配额
- **竞拍机制**：发起碳配额竞拍，支持保证金、密封投标、结算
- **保证金管理**：存入、退还保证金
- **结算与提现**：竞拍结束后结算碳配额与资金
- **合约测试**：覆盖配额发行、保证金、退款等核心流程

### 后端（Go + Gin + GORM）
- **API服务**：提供交易相关RESTful接口
- **数据库**：MySQL，存储交易信息
- **CORS支持**：允许前端跨域访问

### 前端（React + ethers.js）
- **用户界面**：发起交易、保证金管理、投标、结算等操作
- **与后端API交互**：通过RESTful API与后端通信
- **与合约交互**：通过ethers.js与区块链合约交互

---

## 快速开始

### 1. 安装依赖

#### 合约与脚本
```bash
npm install
```

#### 后端
```bash
cd carbon-trading-backend
# 安装Go依赖
go mod tidy
```

#### 前端
```bash
cd carbon-trading-frontend
npm install
```

---

### 2. 数据库配置

后端默认使用MySQL，连接信息在 `carbon-trading-backend/config/db.go`：
```
dsn := "root:12345678@tcp(127.0.0.1:3306)/carbontra?charset=utf8mb4&parseTime=True&loc=Local"
```
请确保本地MySQL已启动并创建好数据库 `carbontra`。

---

### 3. 部署与测试智能合约

#### 编译合约
```bash
npx hardhat compile
```

#### 运行测试
```bash
npx hardhat test
```

#### 部署合约
编辑 `.env` 文件，配置 `INFURA_URL` 和 `PRIVATE_KEY`，并指定 USDT Token 地址（或使用MockToken）：
```env
INFURA_URL=你的Infura节点URL
PRIVATE_KEY=你的钱包私钥
USDT_TOKEN_ADDRESS=你的USDT合约地址（可选）
```
部署：
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

### 4. 启动后端服务

```bash
cd carbon-trading-backend
# 启动服务（默认端口8000）
go run main.go
```

---

### 5. 启动前端

```bash
cd carbon-trading-frontend
npm start
```
前端默认运行在 [http://localhost:3000](http://localhost:3000)

---

## 后端API说明

- `POST /api/trades`  创建交易
- `GET /api/trades`   获取所有交易

请求和响应格式详见 `carbon-trading-backend/controllers/trade.go`。

---

## 主要合约接口（CarbonTrader.sol）
- `issueAllowance(address user, uint256 amount)` 发行碳配额
- `freezeAllowance(address user, uint256 amount)` 冻结碳配额
- `unfreezeAllowance(address user, uint256 amount)` 解冻碳配额
- `destroyAllowance(address user, uint256 amount)` 销毁碳配额
- `startTrade(...)` 发起竞拍
- `deposit(tradeID, amount, info)` 存入保证金
- `refundDeposit(tradeID)` 退还保证金
- `finalizeAuctionAndTransferCarbon(...)` 结算与转移碳配额
- `withdrawAuctionAmount()` 卖家提现



