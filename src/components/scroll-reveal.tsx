"use client";

import { ReactNode, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

/**
 * ScrollReveal 组件 - 滚动显示动画组件
 * 
 * 功能说明：
 * - 当元素滚动进入视口时，触发淡入和上移的动画效果
 * - 使用 Framer Motion 实现流畅的动画过渡
 * - 支持自定义延迟时间和宽度设置
 * - 动画只触发一次（once: true），提升性能
 * 
 * 使用场景：
 * - 为页面元素添加滚动进入视口时的显示动画
 * - 提升用户体验，让内容逐步呈现
 * - 适用于首页各个区块、卡片、列表项等需要动画效果的元素
 */
interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
}

export default function ScrollReveal({
  children,
  width = "100%",
  delay = 0
}: ScrollRevealProps) {
  const ref = useRef(null);
  // 检测元素是否进入视口（once: true 表示只触发一次，amount: 0.5 表示元素 50% 可见时触发）
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  // 动画控制器
  const controls = useAnimation();

  // 当元素进入视口时，启动显示动画
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 20 },  // 隐藏状态：透明 + 向下偏移 20px
        visible: { opacity: 1, y: 0 }   // 显示状态：完全不透明 + 回到原位
      }}
      initial="hidden"  // 初始状态为隐藏
      animate={controls}  // 由控制器控制动画
      transition={{
        duration: 0.5,  // 动画持续 0.5 秒
        delay: delay,   // 自定义延迟时间
        ease: "easeOut" // 缓动函数，先快后慢
      }}
      style={{ width }}
    >
      {children}
    </motion.div>
  );
}