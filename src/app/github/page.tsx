'use client';

import { motion } from 'framer-motion';
import ScrollReveal from '@/components/scroll-reveal';
import GlowCardList, { GlowCardItem } from '@/components/ui/glow-cardList';
import { usePageTitle } from '@/hooks/use-page-title';

const toolsData: GlowCardItem[] = [
  {
    id: "github-typing-svg",
    title: "打字机效果 SVG",
    href: "/github/typing-svg",
  },
  {
    id: "github-countdown",
    title: "倒计时卡片",
    href: "/github/countdown",
  },
  {
    id: "github-joke-card",
    title: "编程笑话卡片",
    href: "/github/joke-card",
  },
  {
    id: "github-crypto-coin",
    title: "加密货币价格",
    href: "/github/crypto-coin",
  },
  {
    id: "github-stats",
    title: "GitHub 统计卡片",
    href: "/github/stats",
  },
  {
    id: "github-top-langs",
    title: "GitHub 语言统计",
    href: "/github/top-langs",
  },
  {
    id: "github-snake",
    title: "GitHub 贪吃蛇",
    href: "/github/snake",
  },
  {
    id: "github-icons",
    title: "图标卡片",
    href: "/github/icons",
  },
];

export default function ToolsPage() {
  usePageTitle('GitHub 工具');

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            GitHub 工具
          </h1>
        </motion.div>

        {/* Tools Grid */}
        <ScrollReveal delay={0.3}>
          <GlowCardList
            items={toolsData}
            columns={3}
            gap="lg"
            className="lg:gap-8 max-w-6xl mx-auto"
          />
        </ScrollReveal>
      </div>
    </div>
  );
}