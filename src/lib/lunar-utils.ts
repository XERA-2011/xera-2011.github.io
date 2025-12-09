import { Lunar, Solar } from 'lunar-javascript';

export interface LunarDateInfo {
  lunarDate: string;
  solarTerm: string;
  festival: string;
  lunarFestival: string;
  zodiac: string;
  ganZhi: string; // Cyclical year (e.g., JiaZi)
}

export const getLunarDateInfo = (date: Date): LunarDateInfo => {
  const lunar = Lunar.fromDate(date);
  
  // Format: "Month Day" e.g. "十月 二十"
  const monthStr = lunar.getMonthInChinese();
  const dayStr = lunar.getDayInChinese();
  
  return {
    lunarDate: `${monthStr}月 ${dayStr}`,
    solarTerm: lunar.getJieQi(),
    festival: getSolarFestivals(date),
    lunarFestival: getLunarFestivals(lunar),
    zodiac: lunar.getYearShengXiao(),
    ganZhi: `${lunar.getYearInGanZhi()}${lunar.getYearShengXiao()}年`,
  };
};

const getSolarFestivals = (date: Date): string => {
  const solar = Solar.fromDate(date);
  const festivals = solar.getFestivals();
  return festivals.join(' ');
};

const getLunarFestivals = (lunar: Lunar): string => {
  const festivals = lunar.getFestivals();
  return festivals.join(' ');
};

// Calculate next occurrence of a Lunar festival
export const getNextLunarFestival = (festivalName: string, targetLunarMonth: number, targetLunarDay: number, currentDate: Date = new Date()) => {
    // Current Lunar Date
    const currentLunar = Lunar.fromDate(currentDate);
    const currentYear = currentLunar.getYear();
    
    // Create target lunar date for this year
    let target = Lunar.fromYmd(currentYear, targetLunarMonth, targetLunarDay);
    
    // If target is in the past (based on Solar date comparison), move to next year
    if (target.getSolar().toYmd() < Solar.fromDate(currentDate).toYmd()) {
        target = Lunar.fromYmd(currentYear + 1, targetLunarMonth, targetLunarDay);
    }

    return {
        date: target.getSolar().toYmd(), 
        lunarDate: `${target.getMonthInChinese()}月 ${target.getDayInChinese()}`,
        diffDays: Math.ceil((new Date(target.getSolar().toYmd()).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    }
}
