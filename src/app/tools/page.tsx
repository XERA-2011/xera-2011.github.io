'use client';

import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import GlowCardList, { GlowCardItem } from '@/components/ui/GlowCardList';
import { usePageTitle } from '@/hooks/use-page-title';

const toolsData: GlowCardItem[] = [
  {
    id: "base64",
    title: "Base64 编码解码",
    href: "/tools/base64",
  },
  {
    id: "info-create",
    title: "信息生成器",
    href: "/tools/info-create",
  },
  {
    id: "joke-card",
    title: "编程笑话卡片",
    href: "/tools/joke-card",
  },
  {
    id: "asset-allocation",
    title: "资产配置占比",
    href: "/tools/asset-allocation",
  },
  {
    id: "life-countdown",
    title: "人生倒计时",
    href: "/tools/life-countdown",
  },
  {
    id: "coze",
    title: "Coze",
    href: "/tools/coze",
  },
  {
    id: "google",
    title: "Google",
    href: "/tools/google",
  },
];

export default function ToolsPage() {
  usePageTitle('在线工具');

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
            在线工具
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