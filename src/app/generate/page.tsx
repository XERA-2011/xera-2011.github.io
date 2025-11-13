'use client';

import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import GlowCardList, { GlowCardItem } from '@/components/ui/GlowCardList';
import { usePageTitle } from '@/hooks/use-page-title';

const generateData: GlowCardItem[] = [
  {
    id: "pet-essays",
    title: "pet3作文",
    href: "/generate/pet-essays",
  },
  {
    id: "news",
    title: "新闻",
    href: "/generate/news",
  },
  {
    id: "security-audit",
    title: "安全审计报告",
    href: "/generate/security-audit",
  },
];

export default function GeneratePage() {
  usePageTitle('生成内容');

  return (
    <div className="relative w-full min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            生成内容
          </h1>
        </motion.div>

        {/* Generate Grid */}
        <ScrollReveal delay={0.3}>
          <GlowCardList
            items={generateData}
            columns={3}
            gap="lg"
            className="lg:gap-8 max-w-6xl mx-auto"
          />
        </ScrollReveal>
      </div>
    </div>
  );
}