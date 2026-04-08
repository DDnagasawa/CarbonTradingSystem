import React, { createContext, useState, useContext, useEffect } from 'react';

const translations = {
  zh: {
    // Header
    dashboard: '市场',
    trade: '交易',
    portfolio: '我的持仓',
    connectWallet: '连接钱包',
    connecting: '连接中...',
    disconnect: '断开',
    wallet: '钱包',

    // KPI
    totalTradingVolume: '总交易量',
    totalValueLocked: '总锁仓量',
    activeTraders: '活跃交易者',
    avgTransactionSize: '平均交易额',
    totalCarbonCredits: '碳信用总量',

    // Tabs
    tokens: '代币',
    topMovers: '热门涨幅',
    newListings: '新上市',

    // Table
    token: '代币',
    price: '价格',
    h1: '1小时',
    h24: '24小时',
    fdv: '市值',
    volume24h: '24小时交易量',
    last7Days: '近7天',
    action: '操作',
    tradeAction: '交易',

    // Trade Modal
    buy: '买入',
    sell: '卖出',
    currentPrice: '当前价格',
    amount: '数量',
    gasFee: 'Gas 费率',
    orderTotal: '订单总额',
    estimatedGas: '预计 Gas 费',
    availableBalance: '可用余额',
    enterValidAmount: '请输入有效数量',
    connectWalletFirst: '请先连接钱包',
    orderExecuted: '订单执行成功!',
    buySymbol: '买入',
    sellSymbol: '卖出',

    // Holdings
    myHoldings: '我的持仓',
    totalValue: '总价值',
    profitLoss: '盈亏',
    noHoldings: '暂无持仓',
    goTrade: '去交易页面购买代币',
    units: '个',

    // Orders
    orderHistory: '交易历史',
    time: '时间',
    type: '类型',
    quantity: '数量',
    total: '总额',
    status: '状态',
    operation: '操作',
    noOrders: '暂无交易记录',
    filled: '已完成',
    pending: '处理中',
    cancelled: '已取消',
    cancel: '取消',
    viewTx: '查看',

    // Portfolio
    ethBalance: 'ETH 余额',
    usdtBalance: 'USDT 余额',
    holdingsCount: '持仓数量',
    tradesCount: '交易笔数',

    // Errors
    loadFailed: '加载数据失败，请检查后端服务是否运行',
    insufficientBalance: '余额不足',
    insufficientTokens: '代币余额不足',
    orderFailed: '订单执行失败',

    // Footer
    version: '区块链碳交易平台',
    poweredBy: 'Powered by Ethereum',
    block: '区块',
  },
  en: {
    // Header
    dashboard: 'Market',
    trade: 'Trade',
    portfolio: 'Portfolio',
    connectWallet: 'Connect Wallet',
    connecting: 'Connecting...',
    disconnect: 'Disconnect',
    wallet: 'Wallet',

    // KPI
    totalTradingVolume: 'Total Trading Volume',
    totalValueLocked: 'Total Value Locked',
    activeTraders: 'Active Traders',
    avgTransactionSize: 'Avg Transaction Size',
    totalCarbonCredits: 'Total Carbon Credits',

    // Tabs
    tokens: 'Tokens',
    topMovers: 'Top Movers',
    newListings: 'New Listings',

    // Table
    token: 'Token',
    price: 'Price',
    h1: '1h %',
    h24: '24h %',
    fdv: 'FDV',
    volume24h: 'Volume(24h)',
    last7Days: 'Last 7 Days',
    action: 'Action',
    tradeAction: 'Trade',

    // Trade Modal
    buy: 'Buy',
    sell: 'Sell',
    currentPrice: 'Current Price',
    amount: 'Amount',
    gasFee: 'Gas Fee',
    orderTotal: 'Order Total',
    estimatedGas: 'Estimated Gas',
    availableBalance: 'Available Balance',
    enterValidAmount: 'Please enter a valid amount',
    connectWalletFirst: 'Please connect your wallet first',
    orderExecuted: 'Order executed successfully!',
    buySymbol: 'Buy',
    sellSymbol: 'Sell',

    // Holdings
    myHoldings: 'My Holdings',
    totalValue: 'Total Value',
    profitLoss: 'P/L',
    noHoldings: 'No Holdings',
    goTrade: 'Go to Trade page to buy tokens',
    units: '',

    // Orders
    orderHistory: 'Order History',
    time: 'Time',
    type: 'Type',
    quantity: 'Quantity',
    total: 'Total',
    status: 'Status',
    operation: 'Operation',
    noOrders: 'No order history',
    filled: 'Filled',
    pending: 'Pending',
    cancelled: 'Cancelled',
    cancel: 'Cancel',
    viewTx: 'View',

    // Portfolio
    ethBalance: 'ETH Balance',
    usdtBalance: 'USDT Balance',
    holdingsCount: 'Holdings Count',
    tradesCount: 'Trades Count',

    // Errors
    loadFailed: 'Failed to load data. Please check if backend is running.',
    insufficientBalance: 'Insufficient balance',
    insufficientTokens: 'Insufficient token balance',
    orderFailed: 'Order execution failed',

    // Footer
    version: 'Carbon Trading System',
    poweredBy: 'Powered by Ethereum',
    block: 'Block',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'zh';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
