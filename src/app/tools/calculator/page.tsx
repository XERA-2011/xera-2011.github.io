"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageTitle } from '@/hooks/use-page-title';
import { cn } from "@/lib/utils";
import { Calculator, Binary, Delete } from "lucide-react";

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

  const backspace = () => {
    if (expr.length === 0) return;
    const newExpr = expr.slice(0, -1);
    setExpr(newExpr);
    setDisplayValue(newExpr || "0");
  };

  const calculate = () => {
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(`"use strict";return (${expr})`)();
      let resultStr = String(result);
      if (resultStr.length > 16) {
        resultStr = String(Number(result).toPrecision(16));
      }
      setExpr(resultStr);
      setDisplayValue(resultStr);
    } catch {
      setDisplayValue("Error");
      setExpr("");
    }
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

  const getFontSize = (len: number) => {
    if (len > 12) return "text-5xl";
    if (len > 8) return "text-6xl";
    return "text-7xl font-normal";
  };

  const isSci = scientific;
  const noop = () => { };

  // Button Size Logic
  const buttonClassRaw = cn(
    "flex justify-center items-center select-none active:scale-95 shadow-[0_2px_5px_rgba(0,0,0,0.05)]",
    isSci
      ? "h-[3.1rem] w-[3.3rem] rounded-[1rem] text-lg font-medium"
      : "h-[4.4rem] w-[4.4rem] rounded-[1.8rem] text-3xl font-normal"
  );

  const BUTTON_BASE = cn(
    buttonClassRaw,
    "bg-[#2C2C2C] text-white",
    "dark:bg-white dark:text-black"
  );

  const BUTTON_NUM = cn(BUTTON_BASE);

  const BUTTON_FN_TEXT_ORANGE = cn(
    BUTTON_BASE,
    "text-[#FF9F0A] font-medium",
    "dark:text-[#FF9F0A]"
  );

  const BUTTON_OP_TEXT_ORANGE = cn(
    BUTTON_BASE,
    "text-[#FF9F0A] font-medium",
    isSci ? "text-xl pb-0.5" : "text-4xl pb-1"
  );

  const BUTTON_EQUAL = cn(
    BUTTON_BASE,
    "bg-[#FF9F0A] text-white shadow-[#FF9F0A]/30",
    "dark:bg-[#FF9F0A] dark:text-white"
  );

  const BUTTON_TOGGLE = cn(BUTTON_FN_TEXT_ORANGE);

  const BUTTON_SCI = cn(
    BUTTON_BASE,
    "text-white",
    "dark:text-black",
    "text-base"
  );

  const MotionButton = motion.button;
  const springTransition = {
    type: "spring" as const,
    stiffness: 280,
    damping: 24,
    mass: 0.5
  };

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-0 sm:px-6 lg:px-8 flex flex-col items-center">
        <h1 className="sr-only">计算器</h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            layout
            transition={springTransition}
            className={cn(
              "w-[360px] max-w-full p-5 rounded-[48px] overflow-hidden mx-auto",
              "bg-[#000000] dark:bg-[#F2F2F2]"
            )}>

            {/* Display Screen */}
            <div className={cn(
              "h-40 mb-4 flex flex-col justify-end px-2 overflow-hidden",
            )}>
              <p className={cn(
                "w-full text-right break-all whitespace-pre-wrap leading-tight transition-all duration-200 tracking-tight px-1 font-sans",
                getFontSize(displayValue.length),
                "!text-white",
                "dark:!text-black"
              )}>
                {displayValue}
              </p>
            </div>

            {/* Main Grid: Explicit Grid Coordinates for Stability */}
            {/* Removed layout from container to avoid grid-gap animation issues */}
            <motion.div
              className={cn(
                "grid gap-3 relative",
                isSci ? "grid-cols-5" : "grid-cols-4"
              )}
            >
              <AnimatePresence mode="popLayout" initial={false}>

                {/* Scientific Rows (Top) */}
                {isSci && (
                  <>
                    <MotionButton key="sci-2nd" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={noop} style={{ gridRow: 1, gridColumn: 1 }}>2nd</MotionButton>
                    <MotionButton key="sci-deg" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={noop} style={{ gridRow: 1, gridColumn: 2 }}>deg</MotionButton>
                    <MotionButton key="sci-sin" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={() => append('Math.sin(')} style={{ gridRow: 1, gridColumn: 3 }}>sin</MotionButton>
                    <MotionButton key="sci-cos" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={() => append('Math.cos(')} style={{ gridRow: 1, gridColumn: 4 }}>cos</MotionButton>
                    <MotionButton key="sci-tan" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={() => append('Math.tan(')} style={{ gridRow: 1, gridColumn: 5 }}>tan</MotionButton>

                    <MotionButton key="sci-pow" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={() => append('**')} style={{ gridRow: 2, gridColumn: 1 }}>xʸ</MotionButton>
                    <MotionButton key="sci-lg" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={() => append('Math.log10(')} style={{ gridRow: 2, gridColumn: 2 }}>lg</MotionButton>
                    <MotionButton key="sci-ln" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={() => append('Math.log(')} style={{ gridRow: 2, gridColumn: 3 }}>ln</MotionButton>
                    <MotionButton key="sci-(" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={() => append('(')} style={{ gridRow: 2, gridColumn: 4 }}>(</MotionButton>
                    <MotionButton key="sci-)" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={() => append(')')} style={{ gridRow: 2, gridColumn: 5 }}>)</MotionButton>
                  </>
                )}

                {/* Standard R1 (Sci R3) */}
                {isSci && <MotionButton key="sci-sqrt" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={() => append('Math.sqrt(')} style={{ gridRow: 3, gridColumn: 1 }}>√</MotionButton>}

                <MotionButton key="AC" layout transition={springTransition} className={BUTTON_FN_TEXT_ORANGE} onClick={clearAll}
                  style={{ gridRow: isSci ? 3 : 1, gridColumn: isSci ? 2 : 1 }}>AC</MotionButton>
                <MotionButton key="DEL" layout transition={springTransition} className={BUTTON_FN_TEXT_ORANGE} onClick={backspace}
                  style={{ gridRow: isSci ? 3 : 1, gridColumn: isSci ? 3 : 2 }}><Delete size={isSci ? 20 : 32} /></MotionButton>
                <MotionButton key="PCT" layout transition={springTransition} className={BUTTON_FN_TEXT_ORANGE} onClick={percent}
                  style={{ gridRow: isSci ? 3 : 1, gridColumn: isSci ? 4 : 3 }}>%</MotionButton>
                <MotionButton key="DIV" layout transition={springTransition} className={BUTTON_OP_TEXT_ORANGE} onClick={() => append('/')}
                  style={{ gridRow: isSci ? 3 : 1, gridColumn: isSci ? 5 : 4 }}>÷</MotionButton>

                {/* Standard R2 (Sci R4) */}
                {isSci && <MotionButton key="sci-fac" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={() => append('!')} style={{ gridRow: 4, gridColumn: 1 }}>x!</MotionButton>}

                <MotionButton key="7" layout transition={springTransition} className={BUTTON_NUM} onClick={() => append('7')}
                  style={{ gridRow: isSci ? 4 : 2, gridColumn: isSci ? 2 : 1 }}>7</MotionButton>
                <MotionButton key="8" layout transition={springTransition} className={BUTTON_NUM} onClick={() => append('8')}
                  style={{ gridRow: isSci ? 4 : 2, gridColumn: isSci ? 3 : 2 }}>8</MotionButton>
                <MotionButton key="9" layout transition={springTransition} className={BUTTON_NUM} onClick={() => append('9')}
                  style={{ gridRow: isSci ? 4 : 2, gridColumn: isSci ? 4 : 3 }}>9</MotionButton>
                <MotionButton key="MUL" layout transition={springTransition} className={BUTTON_OP_TEXT_ORANGE} onClick={() => append('*')}
                  style={{ gridRow: isSci ? 4 : 2, gridColumn: isSci ? 5 : 4 }}>×</MotionButton>

                {/* Standard R3 (Sci R5) */}
                {isSci && <MotionButton key="sci-inv" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={() => append('1/')} style={{ gridRow: 5, gridColumn: 1 }}>1/x</MotionButton>}

                <MotionButton key="4" layout transition={springTransition} className={BUTTON_NUM} onClick={() => append('4')}
                  style={{ gridRow: isSci ? 5 : 3, gridColumn: isSci ? 2 : 1 }}>4</MotionButton>
                <MotionButton key="5" layout transition={springTransition} className={BUTTON_NUM} onClick={() => append('5')}
                  style={{ gridRow: isSci ? 5 : 3, gridColumn: isSci ? 3 : 2 }}>5</MotionButton>
                <MotionButton key="6" layout transition={springTransition} className={BUTTON_NUM} onClick={() => append('6')}
                  style={{ gridRow: isSci ? 5 : 3, gridColumn: isSci ? 4 : 3 }}>6</MotionButton>
                <MotionButton key="SUB" layout transition={springTransition} className={BUTTON_OP_TEXT_ORANGE} onClick={() => append('-')}
                  style={{ gridRow: isSci ? 5 : 3, gridColumn: isSci ? 5 : 4 }}>−</MotionButton>

                {/* Standard R4 (Sci R6) */}
                {isSci && <MotionButton key="sci-pi" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={() => append('Math.PI')} style={{ gridRow: 6, gridColumn: 1 }}>π</MotionButton>}

                <MotionButton key="1" layout transition={springTransition} className={BUTTON_NUM} onClick={() => append('1')}
                  style={{ gridRow: isSci ? 6 : 4, gridColumn: isSci ? 2 : 1 }}>1</MotionButton>
                <MotionButton key="2" layout transition={springTransition} className={BUTTON_NUM} onClick={() => append('2')}
                  style={{ gridRow: isSci ? 6 : 4, gridColumn: isSci ? 3 : 2 }}>2</MotionButton>
                <MotionButton key="3" layout transition={springTransition} className={BUTTON_NUM} onClick={() => append('3')}
                  style={{ gridRow: isSci ? 6 : 4, gridColumn: isSci ? 4 : 3 }}>3</MotionButton>
                <MotionButton key="ADD" layout transition={springTransition} className={BUTTON_OP_TEXT_ORANGE} onClick={() => append('+')}
                  style={{ gridRow: isSci ? 6 : 4, gridColumn: isSci ? 5 : 4 }}>+</MotionButton>

                {/* Standard R5 (Sci R7) - Explicit Placement for Toggle Button */}
                <MotionButton key="TOGGLE" layout transition={springTransition} className={BUTTON_TOGGLE} onClick={toggleMode}
                  style={{ gridRow: isSci ? 7 : 5, gridColumn: 1 }}>
                  {scientific ? <Binary size={20} /> : <Calculator size={28} />}
                </MotionButton>

                {isSci && <MotionButton key="sci-e" layout transition={springTransition} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className={BUTTON_SCI} onClick={() => append('Math.E')} style={{ gridRow: 7, gridColumn: 2 }}>e</MotionButton>}

                <MotionButton key="0" layout transition={springTransition} className={BUTTON_NUM} onClick={() => append('0')}
                  style={{ gridRow: isSci ? 7 : 5, gridColumn: isSci ? 3 : 2 }}>0</MotionButton>
                <MotionButton key="DOT" layout transition={springTransition} className={BUTTON_NUM} onClick={() => append('.')}
                  style={{ gridRow: isSci ? 7 : 5, gridColumn: isSci ? 4 : 3 }}>.</MotionButton>
                <MotionButton key="EQUAL" layout transition={springTransition} className={BUTTON_EQUAL} onClick={calculate}
                  style={{ gridRow: isSci ? 7 : 5, gridColumn: isSci ? 5 : 4 }}>=</MotionButton>

              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
