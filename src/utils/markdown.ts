import fs from 'fs/promises';
import path from 'path';

/**
 * 读取 public/markdown 目录下的 Markdown 文件
 * @param filename - 文件名（例如：'daily-news.md'）
 * @param fallbackMessage - 加载失败时的默认消息
 * @returns Markdown 文件内容
 */
export async function readMarkdownFile(
  filename: string,
  fallbackMessage = '# 加载失败\n\n无法加载内容，请稍后重试。'
): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'markdown', filename);
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return fallbackMessage;
  }
}
