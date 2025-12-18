'use client';

import { motion } from 'framer-motion';
import ScrollReveal from '@/components/scroll-reveal';
import GlowCardList, { GlowCardItem } from '@/components/ui/glow-cardList';
import { usePageTitle } from '@/hooks/use-page-title';

const demoData: GlowCardItem[] = [
  {
    id: 'endless',
    title: 'Endless',
    href: '/demo/endless'
  },
  {
    id: 'solar-skirmish',
    title: 'Solar Skirmish',
    href: '/demo/solar-skirmish'
  },
  {
    id: 'texas-holdem',
    title: 'Texas Hold\'em',
    href: '/demo/texas-holdem.html'
  },
  {
    id: 'x-logo',
    title: 'X Logo',
    href: '/demo/x-logo.html'
  },
  {
    id: 'solar',
    title: 'Solar',
    href: '/demo/solar.html'
  },
  {
    id: 'tetris',
    title: 'Tetris',
    href: '/demo/tetris.html'
  },
];

export default function DemoPage() {
  usePageTitle('演示项目');

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
            演示项目
          </h1>
        </motion.div>

        <ScrollReveal delay={0.3}>
          <GlowCardList
            items={demoData}
            columns={3}
            gap="lg"
            className="lg:gap-8 max-w-6xl mx-auto"
          />
        </ScrollReveal>
      </div>
    </div>
  );
}