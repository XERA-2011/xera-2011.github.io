declare module 'lunar-javascript' {
    export class Lunar {
        static fromDate(date: Date): Lunar;
        static fromYmd(year: number, month: number, day: number): Lunar;
        getMonthInChinese(): string;
        getDayInChinese(): string;
        getYearInGanZhi(): string;
        getYearShengXiao(): string;
        getJieQi(): string;
        getFestivals(): string[];
        getSolar(): Solar;
        getYear(): number;
    }

    export class Solar {
        static fromDate(date: Date): Solar;
        getFestivals(): string[];
        toYmd(): string;
        getYear(): number;
        getMonth(): number;
        getDay(): number;
    }
}
