"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { differenceInSeconds } from "date-fns";
import { Lunar, Solar } from "lunar-javascript";
import { cn } from "@/lib/utils";
import { getQingmingDate } from "./holiday-data"; // 导入清明节日期计算函数

interface HolidayCardProps {
  title: string;
  targetDateStr?: string; // Solar MM-DD
  lunarMonth?: number;
  lunarDay?: number;
  isDynamicDate?: boolean; // 是否是动态日期(如清明节)
  subtitle?: string;
  className?: string; // Allow external styling
}


export default function HolidayCard({ title, targetDateStr, lunarMonth, lunarDay, isDynamicDate, subtitle, className }: HolidayCardProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  const [targetDisplayDate, setTargetDisplayDate] = useState<string>("");
  const [lunarDateStr, setLunarDateStr] = useState<string>("");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      let target: Date;

      if (title === "清明") {
        // 特殊处理清明节的动态日期
        const currentYear = now.getFullYear();
        let qingmingDate = getQingmingDate(currentYear);

        // 如果今年的清明已过，则设置为明年
        if (qingmingDate < now) {
          qingmingDate = getQingmingDate(currentYear + 1);
        }

        target = qingmingDate;
        // 获取该日期的农历
        const l = Lunar.fromDate(target);
        setLunarDateStr(`${l.getMonthInChinese()}月 ${l.getDayInChinese()}`);
      } else if (lunarMonth && lunarDay) {
        // Lunar Calculation
        const currentLunar = Lunar.fromDate(now);
        let targetLunar = Lunar.fromYmd(currentLunar.getYear(), lunarMonth, lunarDay);
        let targetSolar = targetLunar.getSolar();

        // If passed, next year
        if (targetSolar.toYmd() < Solar.fromDate(now).toYmd()) {
          targetLunar = Lunar.fromYmd(currentLunar.getYear() + 1, lunarMonth, lunarDay);
          targetSolar = targetLunar.getSolar();
        }
        target = new Date(targetSolar.getYear(), targetSolar.getMonth() - 1, targetSolar.getDay());
        setLunarDateStr(`${targetLunar.getMonthInChinese()}月 ${targetLunar.getDayInChinese()}`);
      } else if (targetDateStr) {
        // Solar Calculation
        const parts = targetDateStr.split('-').map(Number);
        let month: number, day: number;

        if (parts.length === 2) {
          [month, day] = parts;
        } else {
          [, month, day] = parts;
        }

        const currentYear = now.getFullYear();
        target = new Date(currentYear, month - 1, day);

        if (target < now) {
          target.setFullYear(currentYear + 1);
        }

        // Get lunar date for display
        const l = Lunar.fromDate(target);
        setLunarDateStr(`${l.getMonthInChinese()}月 ${l.getDayInChinese()}`);

      } else {
        console.error(`HolidayCard: No valid date configuration for holiday "${title}"`);
        return;
      }

      setTargetDisplayDate(target.toISOString().split('T')[0]);

      const diffSecs = differenceInSeconds(target, now);

      if (diffSecs <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diffSecs / (3600 * 24));
        const hours = Math.floor((diffSecs % (3600 * 24)) / 3600);
        const minutes = Math.floor((diffSecs % 3600) / 60);
        const seconds = diffSecs % 60;
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr, lunarMonth, lunarDay, isDynamicDate, title]);

  // 如果 still null after calculation, render an error card for debugging
  if (!timeLeft) {
    return (
      <Card className={cn(
        "flex flex-col items-center justify-between p-6 h-full min-h-50",
        "bg-red-100 text-card-foreground shadow-sm transition-all hover:shadow-md",
        className
      )}>
        <div className="w-full flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground">
              {title} (Error)
            </h3>
            <p className="text-muted-foreground text-sm mt-1">Failed to calculate time</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "flex flex-col items-center justify-between p-6 h-full min-h-50",
      "bg-card text-card-foreground shadow-sm transition-all hover:shadow-md",
      className
    )}>
      <div className="w-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">{targetDisplayDate}</p>
          </div>
          <div className="text-right">
            <span className="block text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {lunarDateStr} {subtitle && `· ${subtitle}`}
            </span>
          </div>
        </div>

        <div className="flex justify-center items-center h-24">
          <TimeUnit value={timeLeft.days} label="天" />
        </div>
      </div>
    </Card>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <span className="text-6xl md:text-7xl font-bold text-primary">
        {value}
      </span>
      <span className="text-xl text-muted-foreground self-end pb-2">{label}</span>
    </div>
  );
}
