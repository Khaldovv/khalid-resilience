/**
 * Risk Utilities — Single source of truth for score→severity mapping.
 * Used across the entire platform to ensure consistent risk labeling.
 */

export const scoreToSeverity = (score) => {
  if (!score || score < 1) return { label: { ar: 'غير محدد', en: 'Not Set' }, color: '#64748B', bg: 'rgba(100,116,139,0.15)', border: '#475569' };
  if (score <= 4)  return { label: { ar: 'منخفض جداً', en: 'Very Low' }, color: '#22c55e', bg: 'rgba(34,197,94,0.15)', border: '#16a34a' };
  if (score <= 8)  return { label: { ar: 'منخفض', en: 'Low' }, color: '#eab308', bg: 'rgba(234,179,8,0.15)', border: '#ca8a04' };
  if (score <= 12) return { label: { ar: 'متوسط', en: 'Medium' }, color: '#f97316', bg: 'rgba(249,115,22,0.15)', border: '#ea580c' };
  if (score <= 16) return { label: { ar: 'عالي', en: 'High' }, color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: '#dc2626' };
  if (score <= 20) return { label: { ar: 'حرج', en: 'Critical' }, color: '#ef4444', bg: 'rgba(127,29,29,0.3)', border: '#991b1b' };
  return { label: { ar: 'كارثي', en: 'Catastrophic' }, color: '#991b1b', bg: 'rgba(127,29,29,0.4)', border: '#7f1d1d' };
};

/**
 * Get severity directly from likelihood × impact
 */
export const getSeverityFromScores = (likelihood, impact) => {
  const score = (likelihood || 0) * (impact || 0);
  return { ...scoreToSeverity(score), score };
};
