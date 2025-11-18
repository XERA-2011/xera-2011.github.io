/**
 * 格式化金额为中文货币格式
 * @param amount 金额数字
 * @param options 格式化选项
 * @returns 格式化后的金额字符串
 */
export function formatCurrency(
  amount: number,
  options?: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  }
): string {
  const {
    locale = 'zh-CN',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
  } = options || {};

  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  if (showSymbol) {
    return `¥${formatted}`;
  }

  return formatted;
}

/**
 * 格式化百分比
 * @param value 数值（0-100）
 * @param decimals 小数位数，默认2位
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 格式化数字（千分位分隔）
 * @param value 数字
 * @param decimals 小数位数
 * @returns 格式化后的数字字符串
 */
export function formatNumber(
  value: number,
  decimals?: number
): string {
  if (decimals !== undefined) {
    return value.toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return value.toLocaleString('zh-CN');
}

/**
 * 简化大数字显示（如：1000 -> 1K, 1000000 -> 1M）
 * @param value 数字
 * @param decimals 小数位数，默认1位
 * @returns 简化后的数字字符串
 */
export function formatCompactNumber(value: number, decimals: number = 1): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  }
  return value.toString();
}
