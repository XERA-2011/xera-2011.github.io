// 中国法定节假日数据
import { Solar } from "lunar-javascript";

export interface HolidayData {
  title: string;
  targetDateStr?: string; // 太阳历格式 "MM-DD"
  lunarMonth?: number;    // 农历月份
  lunarDay?: number;      // 农历日期
  isDynamicDate?: boolean; // 是否是动态日期(如清明节)
  subtitle: string;       // 描述信息
}

/**
 * 计算特定年份的清明节日期
 * 清明是二十四节气之一
 * @param year 年份
 * @returns 日期对象
 */
export function getQingmingDate(year: number): Date {
  // 使用 solar 对象来找到当年的清明节
  // 清明节通常是每年的4月4日、5日或6日
  // 这里采用一种更精确的计算方法，利用天文算法近似的公式
  
  // 传统计算公式：Y * 0.2422 + C，其中C值：
  // 1900-1923年：C=5.59
  // 1924-1947年：C=5.63
  // 1948-1971年：C=5.65
  // 1972-1995年：C=5.68
  // 1996-2020年：C=5.79
  // 2021-2044年：C=5.88
  // 2045-2068年：C=5.92
  
  let cValue: number;
  if (year >= 2021 && year <= 2044) {
    cValue = 5.88;
  } else if (year >= 1996 && year <= 2020) {
    cValue = 5.79;
  } else if (year >= 1972 && year <= 1995) {
    cValue = 5.68;
  } else if (year >= 1948 && year <= 1971) {
    cValue = 5.65;
  } else if (year >= 1924 && year <= 1947) {
    cValue = 5.63;
  } else {
    cValue = 5.59;
  }
  
  let day = Math.floor(year * 0.2422 + cValue);
  
  // 考虑到世纪闰年的修正
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    if (year > 2000) {
      day -= 1;
    }
  }
  
  // 清明节通常在4月4日-6日之间
  day = Math.max(4, Math.min(6, day));
  
  return new Date(year, 3, day); // 三月是索引3 (0-based)
}

// 定义所有法定节假日
export const holidays: HolidayData[] = [
  {
    title: "元旦",
    targetDateStr: "01-01",
    subtitle: "新年快乐"
  },
  {
    title: "春节",
    lunarMonth: 1,
    lunarDay: 1,
    subtitle: "农历新年"
  },
  {
    title: "清明",
    isDynamicDate: true, // 标记为动态日期
    subtitle: "踏青扫墓"
  },
  {
    title: "劳动节",
    targetDateStr: "05-01",
    subtitle: "国际劳动节"
  },
  {
    title: "端午",
    lunarMonth: 5,
    lunarDay: 5,
    subtitle: "龙舟竞渡"
  },
  {
    title: "中秋",
    lunarMonth: 8,
    lunarDay: 15,
    subtitle: "团圆佳节"
  },
  {
    title: "国庆",
    targetDateStr: "10-01",
    subtitle: "国庆节"
  }
];