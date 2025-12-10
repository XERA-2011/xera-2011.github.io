// 用户相关常量
export const BASE_URL = 'https://xera-2011.vercel.app';


// 默认头像 - 使用 DiceBear API 生成头像
// 头像会基于用户邮箱生成唯一的图案
export const DEFAULT_AVATAR_BASE_URL = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';

// 生成默认头像URL
export function getDefaultAvatar(seed: string): string {
  return DEFAULT_AVATAR_BASE_URL + encodeURIComponent(seed);
}

// 密码最小长度
export const MIN_PASSWORD_LENGTH = 6;

// 邮箱验证正则
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
