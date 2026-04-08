import React from 'react';
import { useLanguage } from '../i18n';
import MiniSparkline from './MiniSparkline';

const TokenTable = ({ tokens, activeTab, onTrade, isConnected }) => {
  const { t } = useLanguage();

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const renderChange = (value) => {
    const isPositive = value >= 0;
    return (
      <span className={`font-medium ${isPositive ? 'text-positive' : 'text-negative'}`}>
        {isPositive ? '+' : ''}{value.toFixed(2)}%
      </span>
    );
  };

  const filteredTokens = tokens.filter((token) => {
    if (activeTab === 'topMovers') {
      return token.isTopMover || token.is_top_mover;
    }
    if (activeTab === 'newListings') {
      return token.isNewListing || token.is_new_listing;
    }
    return true;
  });

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50">
            <th className="py-3 px-4 font-medium">#</th>
            <th className="py-3 px-4 font-medium">{t('token')}</th>
            <th className="py-3 px-4 font-medium text-right">{t('price')}</th>
            <th className="py-3 px-4 font-medium text-right">{t('h1')}</th>
            <th className="py-3 px-4 font-medium text-right">{t('h24')}</th>
            <th className="py-3 px-4 font-medium text-right">{t('fdv')}</th>
            <th className="py-3 px-4 font-medium text-right">{t('volume24h')}</th>
            <th className="py-3 px-4 font-medium text-right">{t('last7Days')}</th>
            <th className="py-3 px-4 font-medium text-center">{t('action')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredTokens.map((token, index) => {
            const symbol = token.symbol || token.Symbol || '';
            const name = token.name || token.Name || '';
            const color = token.color || token.Color || '#00C853';
            const price = token.price || token.Price || 0;
            const change1h = token.change1h || token.Change1h || 0;
            const change24h = token.change24h || token.Change24h || 0;
            const fdv = token.fdv || token.FDV || 0;
            const volume = token.volume24h || token.Volume24h || 0;
            const sparkline = token.sparklineData || token.SparklineData || [];

            return (
              <tr
                key={symbol || index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4 text-sm text-gray-400">{index + 1}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: color }}
                    >
                      {symbol.charAt(0)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{name}</span>
                      <span className="ml-2 text-sm text-gray-500">{symbol}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-900 tabular-nums">
                  ${formatNumber(price)}
                </td>
                <td className="py-4 px-4 text-right tabular-nums">
                  {renderChange(change1h)}
                </td>
                <td className="py-4 px-4 text-right tabular-nums">
                  {renderChange(change24h)}
                </td>
                <td className="py-4 px-4 text-right text-gray-500 tabular-nums">
                  ${formatNumber(fdv)}
                </td>
                <td className="py-4 px-4 text-right text-gray-500 tabular-nums">
                  ${formatNumber(volume)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-end">
                    <MiniSparkline
                      data={sparkline}
                      positive={change24h >= 0}
                    />
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <button
                    onClick={() => onTrade && onTrade(token)}
                    className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors text-sm font-medium"
                  >
                    {t('tradeAction')}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TokenTable;
