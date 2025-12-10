"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [birthYear, setBirthYear] = useState<string>("1995");
  const [gender, setGender] = useState<string>("male");
  const [retirementAge, setRetirementAge] = useState<string>("65");
  const [retirementDate, setRetirementDate] = useState<Date | null>(null);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load settings from API for logged-in users
  useEffect(() => {
    if (isAuthenticated && !hasLoaded) {
      setIsLoading(true);
      fetch("/api/life-calendar")
        .then((res) => res.json())
        .then((data) => {
          if (data.settings) {
            const { currentAge, targetAge } = data.settings;
            const currentYear = new Date().getFullYear();
            setBirthYear(String(currentYear - Math.floor(currentAge)));
            setRetirementAge(String(Math.floor(targetAge)));
          }
          setHasLoaded(true);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, hasLoaded]);

  // Calculate retirement countdown
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

  // Debounced save function
  const saveSettings = useCallback(
    async (year: string, age: string) => {
      if (!isAuthenticated) return;

      const birthYearNum = parseInt(year);
      const retirementAgeNum = parseInt(age);
      if (isNaN(birthYearNum) || isNaN(retirementAgeNum)) return;

      const currentYear = new Date().getFullYear();
      const currentAge = currentYear - birthYearNum;

      if (currentAge <= 0 || retirementAgeNum <= currentAge) return;

      setIsSaving(true);
      try {
        await fetch("/api/life-calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentAge,
            targetAge: retirementAgeNum,
          }),
        });
      } catch (error) {
        console.error("保存设置失败:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [isAuthenticated]
  );

  // Auto-save when values change (debounced)
  useEffect(() => {
    if (!isAuthenticated || !hasLoaded) return;

    const timer = setTimeout(() => {
      saveSettings(birthYear, retirementAge);
    }, 1000);

    return () => clearTimeout(timer);
  }, [birthYear, retirementAge, isAuthenticated, hasLoaded, saveSettings]);

  return (
    <Card className={cn(
      "flex flex-col p-6 text-card-foreground border-border shadow-md h-full min-h-[300px]",
      "bg-card"
    )}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold">退休倒计时</h3>
          <p className="text-muted-foreground text-sm">
            距离退休还有
            {isAuthenticated && (
              <span className="ml-2 text-xs text-primary">
                {isLoading ? "加载中..." : isSaving ? "保存中..." : "已同步"}
              </span>
            )}
          </p>
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
            disabled={isLoading}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="gender" className="text-xs text-muted-foreground">性别</Label>
          <Select value={gender} onValueChange={setGender} disabled={isLoading}>
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
            disabled={isLoading}
          />
        </div>
      </div>
    </Card>
  );
}
