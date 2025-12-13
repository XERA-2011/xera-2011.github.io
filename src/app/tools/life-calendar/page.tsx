'use client';

import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import { differenceInDays } from 'date-fns';
import TimeCard from "@/components/tools/life-calendar/time-card";
import RetirementCard from "@/components/tools/life-calendar/retirement-card";
import HolidayCard from "@/components/tools/life-calendar/holiday-card";
import { chineseHolidays, internationalHolidays, getQingmingDate } from "@/components/tools/life-calendar/holiday-data";
import { Lunar, Solar } from "lunar-javascript";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// 排序函数：计算节日距离当前日期的天数，并按天数升序排序
function sortHolidaysByDate(holidays: any[]) {
  const now = new Date();
  const currentYear = now.getFullYear();

  return [...holidays].sort((a, b) => {
    // 计算a节日的日期
    let dateA: Date;
    if (a.lunarMonth && a.lunarDay) {
      // 如果是农历节日，需要计算农历对应的公历日期
      const currentLunar = Lunar.fromDate(now);
      let targetLunar = Lunar.fromYmd(currentLunar.getYear(), a.lunarMonth, a.lunarDay);
      let targetSolar = targetLunar.getSolar();

      // 如果今年的节日已过，则设置为明年
      if (targetSolar.toYmd() < Solar.fromDate(now).toYmd()) {
        targetLunar = Lunar.fromYmd(currentLunar.getYear() + 1, a.lunarMonth, a.lunarDay);
        targetSolar = targetLunar.getSolar();
      }
      dateA = new Date(targetSolar.getYear(), targetSolar.getMonth() - 1, targetSolar.getDay());
    } else if (a.isDynamicDate && a.title === "清明") {
      // 动态日期节日（如清明节）
      let qingmingDate = getQingmingDate(currentYear);
      if (qingmingDate < now) {
        qingmingDate = getQingmingDate(currentYear + 1);
      }
      dateA = qingmingDate;
    } else {
      // 公历节日
      const parts = a.targetDateStr.split('-').map(Number);
      let month: number, day: number;

      if (parts.length === 2) {
        [month, day] = parts;
      } else {
        [, month, day] = parts;
      }

      dateA = new Date(currentYear, month - 1, day);
      if (dateA < now) {
        dateA = new Date(currentYear + 1, month - 1, day);
      }
    }

    // 计算b节日的日期
    let dateB: Date;
    if (b.lunarMonth && b.lunarDay) {
      // 如果是农历节日
      const currentLunar = Lunar.fromDate(now);
      let targetLunar = Lunar.fromYmd(currentLunar.getYear(), b.lunarMonth, b.lunarDay);
      let targetSolar = targetLunar.getSolar();

      // 如果今年的节日已过，则设置为明年
      if (targetSolar.toYmd() < Solar.fromDate(now).toYmd()) {
        targetLunar = Lunar.fromYmd(currentLunar.getYear() + 1, b.lunarMonth, b.lunarDay);
        targetSolar = targetLunar.getSolar();
      }
      dateB = new Date(targetSolar.getYear(), targetSolar.getMonth() - 1, targetSolar.getDay());
    } else if (b.isDynamicDate && b.title === "清明") {
      // 动态日期节日（如清明节）
      let qingmingDate = getQingmingDate(currentYear);
      if (qingmingDate < now) {
        qingmingDate = getQingmingDate(currentYear + 1);
      }
      dateB = qingmingDate;
    } else {
      // 公历节日
      const parts = b.targetDateStr.split('-').map(Number);
      let month: number, day: number;

      if (parts.length === 2) {
        [month, day] = parts;
      } else {
        [, month, day] = parts;
      }

      dateB = new Date(currentYear, month - 1, day);
      if (dateB < now) {
        dateB = new Date(currentYear + 1, month - 1, day);
      }
    }

    // 比较两个日期与当前日期的差值
    const diffA = differenceInDays(dateA, now);
    const diffB = differenceInDays(dateB, now);
    return diffA - diffB;
  });
}

export default function TimeDashboardPage() {
  usePageTitle('生命日历');

  // 对节日数组排序
  const sortedChineseHolidays = sortHolidaysByDate(chineseHolidays);
  const sortedInternationalHolidays = sortHolidaysByDate(internationalHolidays);

  return (
    <div className="relative min-h-screen w-full pt-32 pb-20 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            生命日历
          </h1>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {/* Row 1: Time & Retirement */}
          <motion.div variants={itemVariants} className="h-full md:col-span-1 lg:col-span-1">
            <TimeCard />
          </motion.div>
          <motion.div variants={itemVariants} className="h-full md:col-span-1 lg:col-span-2">
            <RetirementCard />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 flex items-center gap-4"
        >
          <h2 className="text-2xl font-bold text-foreground">中国传统节日倒计时</h2>
          <div className="h-px flex-1 bg-border" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {sortedChineseHolidays.map((holiday, index) => (
            <motion.div key={index} variants={itemVariants}>
              <HolidayCard
                title={holiday.title}
                targetDateStr={holiday.targetDateStr}
                lunarMonth={holiday.lunarMonth}
                lunarDay={holiday.lunarDay}
                subtitle={holiday.subtitle}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 flex items-center gap-4"
        >
          <h2 className="text-2xl font-bold text-foreground">国际节日倒计时</h2>
          <div className="h-px flex-1 bg-border" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {sortedInternationalHolidays.map((holiday, index) => (
            <motion.div key={index} variants={itemVariants}>
              <HolidayCard
                title={holiday.title}
                targetDateStr={holiday.targetDateStr}
                lunarMonth={holiday.lunarMonth}
                lunarDay={holiday.lunarDay}
                subtitle={holiday.subtitle}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
