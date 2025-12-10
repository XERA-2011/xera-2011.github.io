/**
 * 通用验证工具库
 */

/**
 * 验证并返回布尔值
 */
export function parseBoolean(value: string): boolean {
  return value.toLowerCase() === 'true';
}

/**
 * 验证并返回正整数
 */
export function parsePositiveInt(value: string, fieldName: string): number {
  const num = Number.parseInt(value.replace(/[^0-9-]/g, ''), 10);
  if (num <= 0 || isNaN(num)) {
    throw new Error(`${fieldName} must be a positive number`);
  }
  return num;
}

/**
 * 验证并返回非负整数
 */
export function parseNonNegativeInt(value: string, fieldName: string): number {
  const num = Number.parseInt(value.replace(/[^0-9-]/g, ''), 10);
  if (num < 0 || isNaN(num)) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }
  return num;
}

/**
 * 验证并返回颜色值
 */
export function parseColor(value: string, defaultValue: string): string {
  const sanitized = value.replace(/[^0-9A-Fa-f]/g, '');
  if (![3, 4, 6, 8].includes(sanitized.length)) {
    return defaultValue;
  }
  return `#${sanitized}`;
}

/**
 * 验证并返回字体名称
 */
export function parseFont(value: string): string {
  return value.replace(/[^0-9A-Za-z\- ]/g, '');
}

/**
 * 转义 HTML 特殊字符
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 验证并返回整数（可以为负数）
 */
export function parseInteger(value: string, fieldName: string): number {
  const num = Number.parseInt(value.replace(/[^0-9-]/g, ''), 10);
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return num;
}

/**
 * 验证并返回浮点数
 */
export function parseFloatNumber(value: string, fieldName: string): number {
  const num = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return num;
}

/**
 * 验证并返回字符串（移除危险字符）
 */
export function sanitizeString(value: string, allowedChars?: RegExp): string {
  const pattern = allowedChars || /[^0-9A-Za-z\-_ ]/g;
  return value.replace(pattern, '');
}

/**
 * 验证 URL 格式
 */
export function parseUrl(value: string): string {
  try {
    const url = new URL(value);
    return url.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * 验证邮箱格式
 */
export function parseEmail(value: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error('Invalid email format');
  }
  return value;
}