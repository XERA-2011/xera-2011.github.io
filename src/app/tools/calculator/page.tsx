"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageTitle } from '@/hooks/use-page-title';
import { cn } from "@/lib/utils";
import { Calculator, Binary, Delete } from "lucide-react";
import { create, all } from 'mathjs';

// Configure mathjs for high precision
import { ConfigOptions } from 'mathjs';

const config: ConfigOptions = {
  number: 'BigNumber',
  precision: 64
};
const math = create(all, config);

export default function CalculatorPage() {
  usePageTitle("计算器");
  const [expr, setExpr] = useState("");
  const [scientific, setScientific] = useState(false);
  const [displayValue, setDisplayValue] = useState("0");

  const append = (v: string) => {
    // If the last character is an operator and the new input is an operator, replace it
    // But allow minus after another operator for negative numbers (e.g. 5 * -3)
    const isOperator = (char: string) => ['+', '-', '*', '/', '^'].includes(char);
    if (expr.length > 0 && isOperator(v) && isOperator(expr.slice(-1))) {
      if (v !== '-' || expr.slice(-1) === '-') { // Allow minus as negative sign
        setExpr(expr.slice(0, -1) + v);
        setDisplayValue(expr.slice(0, -1) + v); // Update display value immediately
        return;
      }
    }

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
      if (!expr) return;
      // Evaluate using mathjs
      const result = math.evaluate(expr);

      // Format the result to avoid scientific notation for common numbers if possible, 
      // or use a clean string representation.
      // precision: 14 ensures we don't get overly long decimals that overflow UI too easily
      const resultStr = math.format(result, { precision: 14 });

      setExpr(resultStr);
      setDisplayValue(resultStr);
    } catch {
      setDisplayValue("Error");
      setExpr("");
    }
  };

  const percent = () => {
    if (!expr) return;
    try {
      // Calculate current expression then divide by 100
      const result = math.evaluate(`(${expr}) / 100`);
      const resultStr = math.format(result, { precision: 14 });
      setExpr(resultStr);
      setDisplayValue(resultStr);
    } catch {
      // If expr is incomplete, just append /100 conceptually or ignore
    }
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
      : "h-[4.65rem] w-[4.4rem] rounded-[1.8rem] text-3xl font-normal"
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
              "w-[360px] max-w-full p-5 rounded-[48px] overflow-hidden mx-auto min-h-[40rem]",
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
            {/* Added layout to container to sync grid changes with children */}
            {/* Main Grid: Explicit Grid Coordinates for Stability */}
            {/* Split into two separate grids to avoid layout thrashing during column count change */}
            <AnimatePresence mode="wait" initial={false}>
              {isSci ? (
                <motion.div
                  key="scientific-grid"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="grid gap-3 relative grid-cols-5"
                >
                  {/* Row 1 */}
                  <MotionButton key="sci-2nd" className={BUTTON_SCI} onClick={noop}>2nd</MotionButton>
                  <MotionButton key="sci-deg" className={BUTTON_SCI} onClick={noop}>deg</MotionButton>
                  <MotionButton key="sci-sin" className={BUTTON_SCI} onClick={() => append('sin(')}>sin</MotionButton>
                  <MotionButton key="sci-cos" className={BUTTON_SCI} onClick={() => append('cos(')}>cos</MotionButton>
                  <MotionButton key="sci-tan" className={BUTTON_SCI} onClick={() => append('tan(')}>tan</MotionButton>

                  {/* Row 2 */}
                  <MotionButton key="sci-pow" className={BUTTON_SCI} onClick={() => append('^')}>xʸ</MotionButton>
                  <MotionButton key="sci-lg" className={BUTTON_SCI} onClick={() => append('log10(')}>lg</MotionButton>
                  <MotionButton key="sci-ln" className={BUTTON_SCI} onClick={() => append('log(')}>ln</MotionButton>
                  <MotionButton key="sci-(" className={BUTTON_SCI} onClick={() => append('(')}>(</MotionButton>
                  <MotionButton key="sci-)" className={BUTTON_SCI} onClick={() => append(')')}>)</MotionButton>

                  {/* Row 3 */}
                  <MotionButton key="sci-sqrt" className={BUTTON_SCI} onClick={() => append('sqrt(')}>√</MotionButton>
                  <MotionButton key="AC" className={BUTTON_FN_TEXT_ORANGE} onClick={clearAll}>AC</MotionButton>
                  <MotionButton key="DEL" className={BUTTON_FN_TEXT_ORANGE} onClick={backspace}><Delete size={20} /></MotionButton>
                  <MotionButton key="PCT" className={BUTTON_FN_TEXT_ORANGE} onClick={percent}>%</MotionButton>
                  <MotionButton key="DIV" className={BUTTON_OP_TEXT_ORANGE} onClick={() => append('/')}>÷</MotionButton>

                  {/* Row 4 */}
                  <MotionButton key="sci-fac" className={BUTTON_SCI} onClick={() => append('!')}>x!</MotionButton>
                  <MotionButton key="7" className={BUTTON_NUM} onClick={() => append('7')}>7</MotionButton>
                  <MotionButton key="8" className={BUTTON_NUM} onClick={() => append('8')}>8</MotionButton>
                  <MotionButton key="9" className={BUTTON_NUM} onClick={() => append('9')}>9</MotionButton>
                  <MotionButton key="MUL" className={BUTTON_OP_TEXT_ORANGE} onClick={() => append('*')}>×</MotionButton>

                  {/* Row 5 */}
                  <MotionButton key="sci-inv" className={BUTTON_SCI} onClick={() => append('1/')}>1/x</MotionButton>
                  <MotionButton key="4" className={BUTTON_NUM} onClick={() => append('4')}>4</MotionButton>
                  <MotionButton key="5" className={BUTTON_NUM} onClick={() => append('5')}>5</MotionButton>
                  <MotionButton key="6" className={BUTTON_NUM} onClick={() => append('6')}>6</MotionButton>
                  <MotionButton key="SUB" className={BUTTON_OP_TEXT_ORANGE} onClick={() => append('-')}>−</MotionButton>

                  {/* Row 6 */}
                  <MotionButton key="sci-pi" className={BUTTON_SCI} onClick={() => append('pi')}>π</MotionButton>
                  <MotionButton key="1" className={BUTTON_NUM} onClick={() => append('1')}>1</MotionButton>
                  <MotionButton key="2" className={BUTTON_NUM} onClick={() => append('2')}>2</MotionButton>
                  <MotionButton key="3" className={BUTTON_NUM} onClick={() => append('3')}>3</MotionButton>
                  <MotionButton key="ADD" className={BUTTON_OP_TEXT_ORANGE} onClick={() => append('+')}>+</MotionButton>

                  {/* Row 7 */}
                  <MotionButton key="TOGGLE" className={BUTTON_TOGGLE} onClick={toggleMode}><Binary size={20} /></MotionButton>
                  <MotionButton key="sci-e" className={BUTTON_SCI} onClick={() => append('e')}>e</MotionButton>
                  <MotionButton key="0" className={BUTTON_NUM} onClick={() => append('0')}>0</MotionButton>
                  <MotionButton key="DOT" className={BUTTON_NUM} onClick={() => append('.')}>.</MotionButton>
                  <MotionButton key="EQUAL" className={BUTTON_EQUAL} onClick={calculate}>=</MotionButton>
                </motion.div>
              ) : (
                <motion.div
                  key="standard-grid"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="grid gap-3 relative grid-cols-4"
                >
                  <MotionButton key="AC" className={BUTTON_FN_TEXT_ORANGE} onClick={clearAll}>AC</MotionButton>
                  <MotionButton key="DEL" className={BUTTON_FN_TEXT_ORANGE} onClick={backspace}><Delete size={32} /></MotionButton>
                  <MotionButton key="PCT" className={BUTTON_FN_TEXT_ORANGE} onClick={percent}>%</MotionButton>
                  <MotionButton key="DIV" className={BUTTON_OP_TEXT_ORANGE} onClick={() => append('/')}>÷</MotionButton>

                  <MotionButton key="7" className={BUTTON_NUM} onClick={() => append('7')}>7</MotionButton>
                  <MotionButton key="8" className={BUTTON_NUM} onClick={() => append('8')}>8</MotionButton>
                  <MotionButton key="9" className={BUTTON_NUM} onClick={() => append('9')}>9</MotionButton>
                  <MotionButton key="MUL" className={BUTTON_OP_TEXT_ORANGE} onClick={() => append('*')}>×</MotionButton>

                  <MotionButton key="4" className={BUTTON_NUM} onClick={() => append('4')}>4</MotionButton>
                  <MotionButton key="5" className={BUTTON_NUM} onClick={() => append('5')}>5</MotionButton>
                  <MotionButton key="6" className={BUTTON_NUM} onClick={() => append('6')}>6</MotionButton>
                  <MotionButton key="SUB" className={BUTTON_OP_TEXT_ORANGE} onClick={() => append('-')}>−</MotionButton>

                  <MotionButton key="1" className={BUTTON_NUM} onClick={() => append('1')}>1</MotionButton>
                  <MotionButton key="2" className={BUTTON_NUM} onClick={() => append('2')}>2</MotionButton>
                  <MotionButton key="3" className={BUTTON_NUM} onClick={() => append('3')}>3</MotionButton>
                  <MotionButton key="ADD" className={BUTTON_OP_TEXT_ORANGE} onClick={() => append('+')}>+</MotionButton>

                  <MotionButton key="TOGGLE" className={BUTTON_TOGGLE} style={{ gridColumn: "span 1" }} onClick={toggleMode}><Calculator size={28} /></MotionButton>
                  <MotionButton key="0" className={BUTTON_NUM} style={{ gridColumn: "span 1" }} onClick={() => append('0')}>0</MotionButton>
                  <MotionButton key="DOT" className={BUTTON_NUM} onClick={() => append('.')}>.</MotionButton>
                  <MotionButton key="EQUAL" className={BUTTON_EQUAL} onClick={calculate}>=</MotionButton>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
