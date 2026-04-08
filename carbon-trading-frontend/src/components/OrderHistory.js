import React from 'react';
import { useLanguage } from '../i18n';

const OrderHistory = ({ orders, onCancel }) => {
  const { t } = useLanguage();

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'FILLED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'FILLED':
        return t('filled');
      case 'PENDING':
        return t('pending');
      case 'CANCELLED':
        return t('cancelled');
      default:
        return status;
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('orderHistory')}</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p>{t('noOrders')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">{t('orderHistory')}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <th className="px-6 py-3 font-medium">{t('time')}</th>
              <th className="px-6 py-3 font-medium">{t('type')}</th>
              <th className="px-6 py-3 font-medium">{t('token')}</th>
              <th className="px-6 py-3 font-medium text-right">{t('quantity')}</th>
              <th className="px-6 py-3 font-medium text-right">{t('price')}</th>
              <th className="px-6 py-3 font-medium text-right">{t('total')}</th>
              <th className="px-6 py-3 font-medium text-right">{t('gasFee')}</th>
              <th className="px-6 py-3 font-medium">{t('status')}</th>
              <th className="px-6 py-3 font-medium">{t('operation')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.orderType === 'BUY'
                        ? 'bg-positive/10 text-positive'
                        : 'bg-negative/10 text-negative'
                    }`}
                  >
                    {order.orderType === 'BUY' ? t('buy') : t('sell')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{order.tokenSymbol}</span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">
                  {order.amount.toFixed(4)}
                </td>
                <td className="px-6 py-4 text-right text-gray-500">
                  ${order.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">
                  ${formatNumber(order.total)}
                </td>
                <td className="px-6 py-4 text-right text-gray-500 text-sm">
                  ${order.gasFee?.toFixed(2) || '0.00'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => onCancel && onCancel(order.orderId)}
                      className="text-sm text-red-500 hover:text-red-700 transition-colors"
                    >
                      {t('cancel')}
                    </button>
                  )}
                  {order.txHash && (
                    <a
                      href={`https://etherscan.io/tx/${order.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-sm text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      {t('viewTx')}
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;
