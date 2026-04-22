import { useState } from 'react';
import { Crosshair } from 'lucide-react';

// ─── Colors synced with RiskMatrix.jsx ─────────────────────────────────────────
const CELL_COLORS = {
  catastrophic: { bg: '#450a0a', border: '#ef4444' },  // score >= 20
  high:         { bg: '#7f1d1d', border: '#dc2626' },  // score >= 15
  medHigh:      { bg: '#9a3412', border: '#ea580c' },  // score >= 10
  medium:       { bg: '#854d0e', border: '#ca8a04' },  // score >= 5
  veryLow:      { bg: '#064e3b', border: '#059669' },  // score < 5
};

function getCellColor(likelihood, impact) {
  const score = likelihood * impact;
  if (score >= 20) return CELL_COLORS.catastrophic;
  if (score >= 15) return CELL_COLORS.high;
  if (score >= 10) return CELL_COLORS.medHigh;
  if (score >= 5)  return CELL_COLORS.medium;
  return CELL_COLORS.veryLow;
}

export default function RiskHeatmapMini({ matrix = {}, lang = 'ar', onNavigate }) {
  const isRtl = lang === 'ar';
  const [tooltip, setTooltip] = useState(null);

  const impactLabels = lang === 'ar'
    ? ['ضعيف جداً', 'ضعيف', 'متوسط', 'عالي', 'كارثي']
    : ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
  const likelihoodLabels = lang === 'ar'
    ? ['نادر', 'غير محتمل', 'ممكن', 'محتمل', 'شبه مؤكد']
    : ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];

  const totalRisks = Object.values(matrix).reduce((sum, row) =>
    sum + Object.values(row).reduce((s, cell) => s + (cell?.count || 0), 0), 0);

  return (
    <div className="rounded-xl border border-slate-800 p-4 transition-all duration-300 h-full"
      style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center justify-between mb-3" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <p className="text-[10px] text-slate-500 tracking-wide">{isRtl ? 'خريطة المخاطر المصغرة' : 'Risk Heatmap'}</p>
          <p className="text-sm font-semibold text-white mt-0.5">{isRtl ? 'مصفوفة 5×5' : '5×5 Matrix'}</p>
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-950/60 border border-red-800/50">
          <Crosshair size={14} className="text-red-400" />
        </div>
      </div>

      {/* 5×5 Grid */}
      <div className="relative">
        {/* Y-axis label */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] text-slate-600 whitespace-nowrap" style={{ left: isRtl ? 'auto' : '-8px', right: isRtl ? '-8px' : 'auto' }}>
          {isRtl ? 'الاحتمالية →' : '← Likelihood'}
        </div>

        <div className={`grid grid-cols-5 gap-[3px] ${isRtl ? 'mr-3' : 'ml-3'}`}>
          {[5, 4, 3, 2, 1].map(likelihood =>
            [1, 2, 3, 4, 5].map(impact => {
              const cell = matrix?.[likelihood]?.[impact] || { count: 0, ids: [] };
              const color = getCellColor(likelihood, impact);
              return (
                <div key={`${likelihood}-${impact}`}
                  className="relative aspect-square rounded-[3px] flex items-center justify-center cursor-pointer transition-all duration-150 hover:scale-110 hover:z-10"
                  style={{
                    background: cell.count > 0 ? color.bg : `${color.bg}40`,
                    border: `1px solid ${cell.count > 0 ? color.border : 'rgba(51,65,85,0.4)'}`,
                    boxShadow: cell.count > 0 ? `0 0 8px ${color.border}33` : 'none',
                  }}
                  onMouseEnter={() => cell.count > 0 && setTooltip({ likelihood, impact, ...cell })}
                  onMouseLeave={() => setTooltip(null)}>
                  <span className={`text-[10px] font-bold ${cell.count > 0 ? 'text-white' : 'text-slate-600'}`}>
                    {cell.count || ''}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* X-axis label */}
        <p className="text-center text-[8px] text-slate-600 mt-1">{isRtl ? '← التأثير' : 'Impact →'}</p>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="mt-2 p-2 rounded-lg bg-slate-800 border border-slate-700 text-[10px]" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
          <p className="text-slate-400">
            {isRtl ? 'الاحتمالية' : 'Likelihood'}: <span className="text-white font-bold">{likelihoodLabels[tooltip.likelihood - 1]}</span>
            {' × '}
            {isRtl ? 'التأثير' : 'Impact'}: <span className="text-white font-bold">{impactLabels[tooltip.impact - 1]}</span>
          </p>
          <p className="text-slate-300 mt-0.5">{tooltip.count} {isRtl ? 'خطر' : 'risks'}: <span className="text-cyan-400 font-mono">{tooltip.ids.slice(0, 3).join(', ')}{tooltip.ids.length > 3 ? '...' : ''}</span></p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <button onClick={() => onNavigate?.('matrix')}
          className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">
          {isRtl ? `${totalRisks} خطر | عرض الخريطة الكاملة ←` : `${totalRisks} risks | View Full Matrix →`}
        </button>
      </div>
    </div>
  );
}
