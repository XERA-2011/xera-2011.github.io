'use client';

import { motion } from 'framer-motion';
import ScrollReveal from '@/components/scroll-reveal';
import GlowCardList, { GlowCardItem } from '@/components/ui/glow-cardList';
import { usePageTitle } from '@/hooks/use-page-title';

const financeToolsData: GlowCardItem[] = [
  {
    id: "alphavantage",
    title: "市场看板",
    href: "/finance/alphavantage",
  },
  {
    id: "asset-allocation",
    title: "资产配置占比",
    href: "/finance/asset-allocation",
  },
  {
    id: "loan-calculator",
    title: "贷款计算器",
    href: "/finance/loan-calculator",
  },
];

export default function FinancePage() {
  usePageTitle('金融工具');

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
            金融工具
          </h1>
        </motion.div>

        {/* Finance Tools Grid */}
        <ScrollReveal delay={0.3}>
          <GlowCardList
            items={financeToolsData}
            columns={3}
            gap="lg"
            className="lg:gap-8 max-w-6xl mx-auto"
          />
        </ScrollReveal>
      </div>
    </div>
  );
}