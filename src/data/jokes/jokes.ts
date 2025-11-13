/**
 * 笑话数据类型定义
 */

// QnA 类型的笑话
export interface QnAJoke {
  q: string;
  a: string;
  form?: 'qa';
}

// 引用类型的笑话（纯文本）
export type QuoteJoke = string;

// 笑话联合类型
export type Joke = QnAJoke | QuoteJoke;

// 笑话数据库
export type JokesDatabase = Record<string, Joke>;

// 导入原始 JSON 数据
import jokesRaw from './jokes-raw.json';

// 导出笑话数据
export const jokes: JokesDatabase = jokesRaw as JokesDatabase;
