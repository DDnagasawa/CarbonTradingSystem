import React from 'react';
import { useLanguage } from '../i18n';

const HoldingsPanel = ({ holdings, tokens, onTrade }) => {
  const { t } = useLanguage();

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const getTokenData = (symbol) => {
    return tokens.find(t => t.symbol === symbol) || {};
  };

  const totalValue = holdings.reduce((sum, h) => {
    const token = getTokenData(h.tokenSymbol);
    return sum + (h.amount * (token.price || 0));
  }, 0);

  const totalPnL = holdings.reduce((sum, h) => {
    const token = getTokenData(h.tokenSymbol);
    const currentValue = h.amount * (token.price || 0);
    const costBasis = h.totalCost;
    return sum + (currentValue - costBasis);
  }, 0);

  if (!holdings || holdings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('myHoldings')}</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
          <p>{t('noHoldings')}</p>
          <p className="text-sm mt-1">{t('goTrade')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{t('myHoldings')}</h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">{t('totalValue')}</p>
            <p className="text-lg font-bold text-brand">${formatNumber(totalValue)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{t('profitLoss')}</p>
            <p className={`text-lg font-bold ${totalPnL >= 0 ? 'text-positive' : 'text-negative'}`}>
              {totalPnL >= 0 ? '+' : ''}{formatNumber(totalPnL)}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {holdings.map((holding) => {
          const token = getTokenData(holding.tokenSymbol);
          const currentValue = holding.amount * (token.price || 0);
          const pnl = currentValue - holding.totalCost;
          const pnlPercent = holding.totalCost > 0 ? ((pnl / holding.totalCost) * 100).toFixed(2) : '0.00';

          return (
            <div key={holding.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: token.color || '#00C853' }}
                  >
                    {holding.tokenSymbol?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{holding.tokenSymbol}</p>
                    <p className="text-sm text-gray-500">{holding.amount.toFixed(4)} {t('units')}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-900">${formatNumber(currentValue)}</p>
                  <p className={`text-sm ${pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent}%)
                  </p>
                </div>

                <button
                  onClick={() => onTrade && onTrade(token)}
                  className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors text-sm font-medium"
                >
                  {t('tradeAction')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HoldingsPanel;
