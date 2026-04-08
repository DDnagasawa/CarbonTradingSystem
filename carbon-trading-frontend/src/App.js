import React, { useState, useEffect, useCallback } from 'react';
import KPICard from './components/KPICard';
import TokenTable from './components/TokenTable';
import TradeModal from './components/TradeModal';
import HoldingsPanel from './components/HoldingsPanel';
import OrderHistory from './components/OrderHistory';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useWeb3, formatAddress } from './hooks/useWeb3';
import { useLanguage } from './i18n';
import { fetchDashboard, fetchTokens, getUser, getUserHoldings, getUserOrders, cancelOrder } from './api';

const formatValue = (value, prefix = '') => {
  if (value >= 1e9) return prefix + (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return prefix + (value / 1e6).toFixed(2) + 'M';
  if (value >= 1e3) return prefix + (value / 1e3).toFixed(2) + 'K';
  return prefix + value.toFixed(2);
};

function App() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('tokens');
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const [selectedToken, setSelectedToken] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);

  const { account, isConnected, connect, disconnect, isConnecting } = useWeb3();
  const [user, setUser] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [orders, setOrders] = useState([]);

  const [stats, setStats] = useState({
    totalVolume: '0',
    totalVolumeChange: 0,
    totalValue: '0',
    totalValueChange: 0,
    activeTraders: '0',
    activeTradersChange: 0,
    avgTransaction: '0',
    avgTransactionChange: 0,
    totalCarbonCredits: '0',
    carbonCreditsChange: 0,
  });

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboard();

      if (data.stats) {
        setStats({
          totalVolume: formatValue(data.stats.totalVolume),
          totalVolumeChange: data.stats.totalVolumeChange,
          totalValue: formatValue(data.stats.totalValue, '$'),
          totalValueChange: data.stats.totalValueChange,
          activeTraders: data.stats.activeTraders?.toLocaleString() || '0',
          activeTradersChange: data.stats.activeTradersChange,
          avgTransaction: formatValue(data.stats.avgTransaction, '$'),
          avgTransactionChange: data.stats.avgTransactionChange,
          totalCarbonCredits: formatValue(data.stats.totalCarbonCredits),
          carbonCreditsChange: data.stats.carbonCreditsChange,
        });
      }

      if (data.tokens) {
        setTokens(data.tokens);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(t('loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadTokens = useCallback(async () => {
    try {
      const tabMap = { tokens: 'Tokens', topMovers: 'Top Movers', newListings: 'New Listings' };
      const data = await fetchTokens(tabMap[activeTab]);
      setTokens(data);
    } catch (err) {
      console.error('Failed to load tokens:', err);
    }
  }, [activeTab]);

  const loadUserData = useCallback(async () => {
    if (!account) return;

    try {
      const userData = await getUser(account);
      setUser(userData);

      if (userData && userData.id) {
        const [holdingsData, ordersData] = await Promise.all([
          getUserHoldings(userData.id),
          getUserOrders(userData.id),
        ]);
        setHoldings(holdingsData || []);
        setOrders(ordersData || []);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  }, [account]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard();
      if (account) loadUserData();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadDashboard, loadUserData, account]);

  const handleTradeSuccess = () => {
    loadUserData();
    loadDashboard();
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
      loadUserData();
    } catch (err) {
      alert(t('orderFailed') + ': ' + err.message);
    }
  };

  const handleTrade = (token) => {
    setSelectedToken(token);
    setShowTradeModal(true);
  };

  const tabs = [
    { key: 'tokens', label: t('tokens') },
    { key: 'topMovers', label: t('topMovers') },
    { key: 'newListings', label: t('newListings') },
  ];

  const pageLabels = {
    dashboard: t('dashboard'),
    trade: t('trade'),
    portfolio: t('portfolio'),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Carbon Trading</h1>
            </div>

            <nav className="flex items-center gap-1">
              {['dashboard', 'trade', 'portfolio'].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-brand text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageLabels[page]}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {isConnected ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatAddress(account)}</p>
                    {user && (
                      <p className="text-xs text-gray-500">USDT: ${user.usdtBalance?.toFixed(2)}</p>
                    )}
                  </div>
                  <button
                    onClick={disconnect}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    {t('disconnect')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium"
                >
                  {isConnecting ? t('connecting') : t('connectWallet')}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Dashboard Page */}
        {currentPage === 'dashboard' && (
          <>
            {loading && !error && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
                Loading...
              </div>
            )}

            <section className="mb-10">
              <div className="flex gap-8 flex-wrap">
                <KPICard label={t('totalTradingVolume')} value={stats.totalVolume} change={stats.totalVolumeChange} changeLabel="24h" />
                <KPICard label={t('totalValueLocked')} value={stats.totalValue} change={stats.totalValueChange} changeLabel="24h" />
                <KPICard label={t('activeTraders')} value={stats.activeTraders} change={stats.activeTradersChange} changeLabel="7d" />
                <KPICard label={t('avgTransactionSize')} value={stats.avgTransaction} change={stats.avgTransactionChange} changeLabel="24h" />
                <KPICard label={t('totalCarbonCredits')} value={stats.totalCarbonCredits} change={stats.carbonCreditsChange} changeLabel="30d" />
              </div>
            </section>

            <section className="mb-6">
              <div className="flex gap-8 border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-3 text-sm font-medium transition-colors relative ${
                      activeTab === tab.key ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.key && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            <section>
              {tokens.length > 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <TokenTable tokens={tokens} activeTab={activeTab} onTrade={handleTrade} isConnected={isConnected} />
                </div>
              ) : (
                !loading && !error && (
                  <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
                    No tokens found.
                  </div>
                )
              )}
            </section>
          </>
        )}

        {/* Trade Page */}
        {currentPage === 'trade' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">{t('tokens')}</h2>
                </div>
                <TokenTable tokens={tokens} activeTab="tokens" onTrade={handleTrade} isConnected={isConnected} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('wallet')}</h3>
                {isConnected ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('token')}</span>
                      <span className="font-medium">{formatAddress(account)}</span>
                    </div>
                    {user && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ETH</span>
                          <span className="font-medium">{user.ethBalance?.toFixed(4)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">USDT</span>
                          <span className="font-medium">${user.usdtBalance?.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-3">{t('connectWalletFirst')}</p>
                    <button onClick={connect} className="w-full py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand/90 transition-colors">
                      {t('connectWallet')}
                    </button>
                  </div>
                )}
              </div>

              <HoldingsPanel holdings={holdings} tokens={tokens} onTrade={handleTrade} />
              <OrderHistory orders={orders.slice(0, 5)} onCancel={handleCancelOrder} />
            </div>
          </div>
        )}

        {/* Portfolio Page */}
        {currentPage === 'portfolio' && (
          <div className="space-y-8">
            {user && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-1">{t('ethBalance')}</p>
                  <p className="text-2xl font-bold text-gray-900">{user.ethBalance?.toFixed(4)} ETH</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-1">{t('usdtBalance')}</p>
                  <p className="text-2xl font-bold text-brand">${user.usdtBalance?.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-1">{t('holdingsCount')}</p>
                  <p className="text-2xl font-bold text-gray-900">{holdings.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-1">{t('tradesCount')}</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            )}

            <HoldingsPanel holdings={holdings} tokens={tokens} onTrade={handleTrade} />
            <OrderHistory orders={orders} onCancel={handleCancelOrder} />
          </div>
        )}
      </main>

      {showTradeModal && selectedToken && (
        <TradeModal
          token={selectedToken}
          user={user}
          onClose={() => {
            setShowTradeModal(false);
            setSelectedToken(null);
          }}
          onTradeSuccess={handleTradeSuccess}
        />
      )}

      <footer className="max-w-7xl mx-auto px-8 py-8 mt-16 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Carbon Trading {t('version')}</span>
          <div className="flex gap-6">
            <span>{t('poweredBy')}</span>
            <span>{t('block')}: 18,234,567</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
