/**
 * 本地存储工具类
 * 提供类型安全的 localStorage 操作方法
 */

/**
 * 从 localStorage 读取数据
 * @param key 存储键名
 * @param defaultValue 默认值（当读取失败或不存在时返回）
 * @returns 解析后的数据或默认值
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const stored = localStorage.getItem(key);
    if (stored === null) {
      return defaultValue;
    }
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`读取 localStorage 失败 (key: ${key}):`, error);
    return defaultValue;
  }
}

/**
 * 保存数据到 localStorage
 * @param key 存储键名
 * @param value 要保存的数据
 * @returns 是否保存成功
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`保存到 localStorage 失败 (key: ${key}):`, error);
    return false;
  }
}

/**
 * 从 localStorage 删除数据
 * @param key 存储键名
 * @returns 是否删除成功
 */
export function removeLocalStorage(key: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`删除 localStorage 失败 (key: ${key}):`, error);
    return false;
  }
}

/**
 * 清空所有 localStorage 数据
 * @returns 是否清空成功
 */
export function clearLocalStorage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('清空 localStorage 失败:', error);
    return false;
  }
}
