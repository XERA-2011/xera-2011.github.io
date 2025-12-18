"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { getLunarDateInfo, LunarDateInfo } from "@/lib/lunar-utils";
import { cn } from "@/lib/utils";


export default function TimeCard() {
  const [now, setNow] = useState<Date | null>(null);
  const [lunarInfo, setLunarInfo] = useState<LunarDateInfo | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const currentDate = new Date();
      setNow(currentDate);
      setLunarInfo(getLunarDateInfo(currentDate));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now || !lunarInfo) return null;

  return (
    <Card className={cn(
      "flex flex-col items-center justify-center p-6 text-card-foreground border-border shadow-md h-full min-h-75",
      "bg-card relative overflow-hidden"
    )}>
      <div className="relative z-10 text-center space-y-4">
        <div className="space-y-1">
          <div className="text-lg text-muted-foreground font-medium">今天是</div>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {format(now, "yyyy年 MM月")}
          </div>
        </div>

        <div className="py-2">
          <div className="text-8xl font-black text-foreground leading-none">
            {format(now, "dd")}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-2xl font-medium text-foreground/90">
            {format(now, "EEEE", { locale: zhCN })}
          </div>
          <div className="text-4xl font-mono font-bold tracking-widest text-primary">
            {format(now, 'HH:mm:ss')}
          </div>
        </div>

        <div className="pt-4 border-t border-border w-full mt-2">
          <div className="flex justify-between items-center text-sm md:text-base px-2">
            <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">
              第 <span className="text-primary font-bold mx-1">{format(now, "w")}</span> 周
            </span>
            <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">
              {lunarInfo.ganZhi} {lunarInfo.lunarDate}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
