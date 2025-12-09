'use client';

import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import TimeCard from "@/components/tools/time-dashboard/time-card";
import RetirementCard from "@/components/tools/time-dashboard/retirement-card";
import HolidayCard from "@/components/tools/time-dashboard/holiday-card";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function TimeDashboardPage() {
  usePageTitle('人生倒计时');

  return (
    <div className="relative min-h-screen w-full pt-32 pb-20 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            时间仪表盘
          </h1>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {/* Row 1: Time & Retirement */}
          <motion.div variants={itemVariants} className="h-full">
            <TimeCard />
          </motion.div>
          <motion.div variants={itemVariants} className="h-full md:col-span-2 lg:col-span-2">
            <RetirementCard />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 flex items-center gap-4"
        >
          <h2 className="text-2xl font-bold text-foreground">节日倒计时</h2>
          <div className="h-px flex-1 bg-border" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={itemVariants}>
            <HolidayCard
              title="元旦"
              targetDateStr="01-01"
              subtitle="新年伊始"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <HolidayCard
              title="春节"
              lunarMonth={1}
              lunarDay={1}
              subtitle="农历新年"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <HolidayCard
              title="中秋"
              lunarMonth={8}
              lunarDay={15}
              subtitle="团圆"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <HolidayCard
              title="国庆"
              targetDateStr="10-01"
              subtitle="国庆节"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
