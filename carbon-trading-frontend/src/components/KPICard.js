import React from 'react';

const KPICard = ({ label, value, change, changeLabel }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </span>
      <span className="text-3xl font-bold text-gray-900 tabular-nums mb-2">
        {value}
      </span>
      <div className="flex items-center gap-1">
        <span className={`text-sm font-medium ${isPositive ? 'text-positive' : 'text-negative'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </span>
        <span className="text-xs text-gray-400">{changeLabel}</span>
      </div>
    </div>
  );
};

export default KPICard;