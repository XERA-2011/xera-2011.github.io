"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { differenceInDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";


export default function RetirementCard() {
  const [birthYear, setBirthYear] = useState<string>("1995");
  const [gender, setGender] = useState<string>("male");
  const [retirementAge, setRetirementAge] = useState<string>("65");
  const [retirementDate, setRetirementDate] = useState<Date | null>(null);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const year = parseInt(birthYear);
    const age = parseInt(retirementAge);

    if (!isNaN(year) && !isNaN(age)) {
      const retireYear = year + age;
      const retireDt = new Date(retireYear, 0, 1);
      setRetirementDate(retireDt);

      const now = new Date();
      const diff = differenceInDays(retireDt, now);
      setDaysLeft(diff > 0 ? diff : 0);

      const totalDays = age * 365.25;
      const daysLived = differenceInDays(now, new Date(year, 0, 1));
      const percentage = Math.min(100, Math.max(0, (daysLived / totalDays) * 100));
      setProgress(percentage);
    }

  }, [birthYear, gender, retirementAge]);


  return (
    <Card className={cn(
      "flex flex-col p-6 text-card-foreground border-border shadow-md h-full min-h-[300px]",
      "bg-card"
    )}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold">退休倒计时</h3>
          <p className="text-muted-foreground text-sm">距离退休还有</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-black">{daysLeft}</span> <span className="text-sm">天</span>
        </div>
      </div>

      <div className="space-y-2 mb-8">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>进度 ({progress.toFixed(1)}%)</span>
          <span>{retirementDate?.getFullYear()}年退休</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      <div className="mt-auto grid grid-cols-3 gap-3 bg-muted/50 p-4 rounded-xl border border-border">
        <div className="space-y-1">
          <Label htmlFor="year" className="text-xs text-muted-foreground">出生年份</Label>
          <Input
            id="year"
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="gender" className="text-xs text-muted-foreground">性别</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">男</SelectItem>
              <SelectItem value="female">女</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="retireAge" className="text-xs text-muted-foreground">退休年龄</Label>
          <Input
            id="retireAge"
            type="number"
            value={retirementAge}
            onChange={(e) => setRetirementAge(e.target.value)}
            className="h-8"
          />
        </div>
      </div>
    </Card>
  );
}
