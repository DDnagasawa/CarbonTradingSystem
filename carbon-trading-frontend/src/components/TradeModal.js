import React, { useState } from 'react';
import { useLanguage } from '../i18n';
import { createOrder } from '../api';

const TradeModal = ({ token, user, onClose, onTradeSuccess }) => {
  const { t } = useLanguage();
  const [orderType, setOrderType] = useState('BUY');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const price = token.price || 0;
  const total = amount ? (parseFloat(amount) * price).toFixed(2) : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!amount || parseFloat(amount) <= 0) {
      setError(t('enterValidAmount'));
      return;
    }

    if (!user || !user.id) {
      setError(t('connectWalletFirst'));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrder({
        userId: user.id,
        tokenId: token.id,
        tokenSymbol: token.symbol,
        orderType: orderType,
        price: price,
        amount: parseFloat(amount),
      });

      setSuccess(t('orderExecuted'));
      setAmount('');

      if (onTradeSuccess) {
        onTradeSuccess(result);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || t('orderFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const setPercentage = (percent) => {
    if (orderType === 'BUY' && user) {
      const maxBuy = user.usdtBalance / price;
      setAmount((maxBuy * percent / 100).toFixed(4));
    } else {
      setAmount((percent * 10).toFixed(4));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: token.color }}
            >
              {token.symbol?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{token.symbol}</h3>
              <p className="text-sm text-gray-500">{token.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setOrderType('BUY')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                orderType === 'BUY'
                  ? 'bg-positive text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('buy')}
            </button>
            <button
              type="button"
              onClick={() => setOrderType('SELL')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                orderType === 'SELL'
                  ? 'bg-negative text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('sell')}
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{t('currentPrice')}</span>
              <span className="font-bold text-lg">${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">{t('amount')}</span>
              <span className="font-medium">{amount || '0'} {token.symbol}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">{t('gasFee')}</span>
              <span className="text-sm">0.30%</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('amount')} ({token.symbol})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.0001"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none text-lg"
            />
          </div>

          <div className="flex gap-2 mb-6">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setPercentage(pct)}
                className="flex-1 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className="bg-brand/5 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('orderTotal')}</span>
              <span className="text-xl font-bold text-brand">${total}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-500">{t('estimatedGas')}</span>
              <span className="text-sm text-gray-500">
                ${(parseFloat(total) * 0.003).toFixed(2)}
              </span>
            </div>
          </div>

          {user && (
            <div className="text-sm text-gray-500 mb-4">
              {t('availableBalance')}: <span className="font-medium text-gray-700">
                {orderType === 'BUY'
                  ? `$${user.usdtBalance?.toFixed(2)} USDT`
                  : `${amount || '0'} ${token.symbol}`
                }
              </span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !amount}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
              orderType === 'BUY'
                ? 'bg-positive hover:bg-positive/90 text-white'
                : 'bg-negative hover:bg-negative/90 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? '...' : `${t(orderType === 'BUY' ? 'buySymbol' : 'sellSymbol')} ${token.symbol}`}
          </button>

          {!user && (
            <p className="text-center text-sm text-gray-500 mt-3">
              {t('connectWalletFirst')}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default TradeModal;
