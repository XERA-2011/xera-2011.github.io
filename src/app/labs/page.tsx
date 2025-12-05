'use client';

import { motion } from 'framer-motion';
import ScrollReveal from '@/components/scroll-reveal';
import GlowCardList, { GlowCardItem } from '@/components/ui/glow-cardList';
import { usePageTitle } from '@/hooks/use-page-title';

const labsData: GlowCardItem[] = [
  {
    id: 'endless',
    title: 'Endless',
    href: '/labs/endless'
  },
  {
    id: 'solar-skirmish',
    title: 'Solar Skirmish',
    href: '/labs/solar-skirmish'
  },
];

export default function LabsPage() {
  usePageTitle('实验项目');

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
            实验项目
          </h1>
        </motion.div>

        {/* Labs Grid */}
        <ScrollReveal delay={0.3}>
          <GlowCardList
            items={labsData}
            columns={3}
            gap="lg"
            className="lg:gap-8 max-w-6xl mx-auto"
          />
        </ScrollReveal>
      </div>
    </div>
  );
}