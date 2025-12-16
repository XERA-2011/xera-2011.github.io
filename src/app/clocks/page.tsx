'use client';

import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import ClockCircle from '@/components/clocks/circle';
import ClockJump from '@/components/clocks/jump';
import ClockRoulette from '@/components/clocks/roulette';
import ClockSolar from '@/components/clocks/solar';
import ClockSteampunk from '@/components/clocks/steampunk';

export default function ClocksPage() {
  usePageTitle('时钟集合');

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
            时钟集合
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">圆形时钟</h2>
            <ClockCircle staticTime="10:10:30" />
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">跳跳时钟</h2>
            <ClockJump staticTime="10:10:30" />
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">轮盘时钟</h2>
            <ClockRoulette staticTime="10:10:30" />
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">太阳系时钟</h2>
            <ClockSolar staticTime="10:10:30" />
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">蒸汽朋克时钟</h2>
            <ClockSteampunk staticTime="10:10:30" />
          </div>
        </div>
      </div>
    </div>
  );
}