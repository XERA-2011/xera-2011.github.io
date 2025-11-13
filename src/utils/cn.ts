import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 组合 Tailwind 样式类的工具函数
 * - clsx: 处理条件拼接
 * - twMerge: 处理 Tailwind 样式冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
