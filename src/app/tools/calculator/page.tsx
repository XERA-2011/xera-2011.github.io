"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageTitle } from '@/hooks/use-page-title';
import { cn } from "@/lib/utils";

export default function CalculatorPage() {
  usePageTitle("计算器");
  const [expr, setExpr] = useState("");
  const [scientific, setScientific] = useState(false);
  const [displayValue, setDisplayValue] = useState("0");

  const append = (v: string) => {
    const newExpr = expr + v;
    setExpr(newExpr);
    setDisplayValue(newExpr);
  };

  const clearAll = () => {
    setExpr("");
    setDisplayValue("0");
  };

  const calculate = () => {
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(`"use strict";return (${expr})`)();
      let resultStr = String(result);
      if (resultStr.length > 12) {
        resultStr = String(Number(result).toPrecision(12));
      }
      setExpr(resultStr);
      setDisplayValue(resultStr);
    } catch {
      setDisplayValue("Error");
      setExpr("");
    }
  };

  const toggleSign = () => {
    if (!expr) return;
    const newExpr = expr.startsWith("-") ? expr.slice(1) : "-" + expr;
    setExpr(newExpr);
    setDisplayValue(newExpr);
  };

  const percent = () => {
    if (!expr) return;
    const newExpr = String(Number(expr) / 100);
    setExpr(newExpr);
    setDisplayValue(newExpr);
  };

  const toggleMode = () => {
    setScientific(!scientific);
  };

  // 基础按钮样式 - 适配黑白极简主题
  const BUTTON_BASE = cn(
    "h-14 rounded-xl text-xl cursor-pointer flex justify-center items-center select-none border-none p-0",
    "active:translate-y-[2px] transition-all duration-150",
    "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-2px_4px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)]",
    // 默认数字键：主体深色，文字浅色
    "bg-card text-foreground border border-border/10",
    "hover:bg-accent hover:text-accent-foreground"
  );

  // 功能键 (AC, +/-, %)：稍亮一些
  const BUTTON_FN = cn(
    "bg-muted text-muted-foreground font-medium",
    "hover:bg-muted/80 hover:text-foreground"
  );

  // 运算键 (+, -, *, /)：强调色 (使用项目原本的强调设计，比如黑色背景白色文字，或者反之)
  const BUTTON_OP = cn(
    "bg-foreground text-background font-bold",
    "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)]",
    "hover:opacity-90 active:scale-[0.98]"
  );

  // 等号键：最强强调
  const BUTTON_EQUAL = cn(
    "bg-foreground text-background font-bold",
    "shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.3)]",
    "hover:scale-[1.02] active:scale-[0.98]"
  );

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-0 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Page Title */}
        <h1 className="sr-only">计算器</h1>

        {/* Calculator Body */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className={cn(
            "w-[340px] max-w-full p-3.5 rounded-[26px] transition-all duration-300 ease-in-out mx-auto",
            // 外壳使用卡片背景色，添加边框和细腻的阴影
            "bg-card border border-border",
            "shadow-[0_20px_40px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]",
            "dark:shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]"
          )}>

            {/* Top Bar with Toggle */}
            <div className="flex justify-between items-center mb-4 px-2 text-muted-foreground text-[13px] font-medium tracking-wide">
              <span>{scientific ? "科学模式" : "普通模式"}</span>
              <div
                className={cn(
                  "w-[60px] h-7 rounded-full bg-muted relative cursor-pointer shadow-inner transition-colors",
                  "hover:bg-muted/80",
                  "after:content-[''] after:absolute after:w-[26px] after:h-[22px] after:top-[3px] after:rounded-full after:bg-foreground after:shadow-sm after:transition-all after:duration-300 after:ease-out",
                  scientific
                    ? "after:left-[31px]"
                    : "after:left-[3px]"
                )}
                onClick={toggleMode}
              />
            </div>

            {/* Display Screen */}
            <div className={cn(
              "h-20 mb-5 rounded-xl flex items-center justify-end px-5 text-[40px] overflow-hidden whitespace-nowrap font-mono tracking-tight",
              // 屏幕背景调整为深色（日间）或更深色（夜间），保持高对比度
              "bg-foreground/5 text-foreground font-light shadow-inner border border-black/5 dark:border-white/5"
            )}>
              {displayValue}
            </div>

            {/* Scientific Keys */}
            <AnimatePresence>
              {scientific && (
                <motion.div
                  className="grid grid-cols-4 gap-3 overflow-hidden"
                  initial={{ height: 0, opacity: 0, marginBottom: 0, y: -20, scaleY: 0.8 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    marginBottom: 12,
                    y: 0,
                    scaleY: 1,
                    transition: {
                      height: { type: "spring", stiffness: 400, damping: 30 },
                      marginBottom: { type: "spring", stiffness: 400, damping: 30 },
                      opacity: { duration: 0.2 },
                      default: { type: "spring", stiffness: 400, damping: 30 }
                    }
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    marginBottom: 0,
                    y: -10,
                    scaleY: 0.8,
                    transition: {
                      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                      marginBottom: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                      opacity: { duration: 0.2 },
                      y: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                      scaleY: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
                    }
                  }}
                >
                  <button className={cn(BUTTON_BASE, BUTTON_FN)} onClick={() => append('Math.sin(')}>sin</button>
                  <button className={cn(BUTTON_BASE, BUTTON_FN)} onClick={() => append('Math.cos(')}>cos</button>
                  <button className={cn(BUTTON_BASE, BUTTON_FN)} onClick={() => append('Math.tan(')}>tan</button>
                  <button className={cn(BUTTON_BASE, BUTTON_FN)} onClick={() => append('Math.PI')}>π</button>

                  <button className={cn(BUTTON_BASE, BUTTON_FN)} onClick={() => append('Math.log(')}>ln</button>
                  <button className={cn(BUTTON_BASE, BUTTON_FN)} onClick={() => append('Math.log10(')}>log</button>
                  <button className={cn(BUTTON_BASE, BUTTON_FN)} onClick={() => append('Math.sqrt(')}>√</button>
                  <button className={cn(BUTTON_BASE, BUTTON_FN)} onClick={() => append('Math.E')}>e</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Standard Keys */}
            <div className="grid grid-cols-4 gap-3">
              <button className={cn(BUTTON_BASE, BUTTON_FN)} onClick={clearAll}>AC</button>
              <button className={cn(BUTTON_BASE, BUTTON_FN)} onClick={toggleSign}>±</button>
              <button className={cn(BUTTON_BASE, BUTTON_FN)} onClick={percent}>%</button>
              <button className={cn(BUTTON_BASE, BUTTON_OP)} onClick={() => append('/')}>÷</button>

              <button className={BUTTON_BASE} onClick={() => append('7')}>7</button>
              <button className={BUTTON_BASE} onClick={() => append('8')}>8</button>
              <button className={BUTTON_BASE} onClick={() => append('9')}>9</button>
              <button className={cn(BUTTON_BASE, BUTTON_OP)} onClick={() => append('*')}>×</button>

              <button className={BUTTON_BASE} onClick={() => append('4')}>4</button>
              <button className={BUTTON_BASE} onClick={() => append('5')}>5</button>
              <button className={BUTTON_BASE} onClick={() => append('6')}>6</button>
              <button className={cn(BUTTON_BASE, BUTTON_OP)} onClick={() => append('-')}>−</button>

              <button className={BUTTON_BASE} onClick={() => append('1')}>1</button>
              <button className={BUTTON_BASE} onClick={() => append('2')}>2</button>
              <button className={BUTTON_BASE} onClick={() => append('3')}>3</button>
              <button className={cn(BUTTON_BASE, BUTTON_EQUAL)} onClick={calculate}>=</button>

              <button className={cn(BUTTON_BASE, "col-span-2")} onClick={() => append('0')}>0</button>
              <button className={BUTTON_BASE} onClick={() => append('.')}>.</button>
              <button className={cn(BUTTON_BASE, BUTTON_OP)} onClick={() => append('+')}>+</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
