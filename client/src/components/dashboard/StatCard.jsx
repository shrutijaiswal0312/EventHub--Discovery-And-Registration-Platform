import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'brand' // 'brand' | 'success' | 'warning' | 'danger'
}) => {
  const variantMap = {
    brand: {
      bg: 'bg-brand-50 text-brand-600',
      border: 'border-brand-100'
    },
    success: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100'
    },
    warning: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100'
    },
    danger: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100'
    }
  };

  const style = variantMap[variant] || variantMap.brand;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-3.5 rounded-2xl ${style.bg} shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
