"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="py-8 text-center text-sm text-neutral-400"
    >
      <div className="flex flex-col items-center gap-2">
        <Link
          href="https://github.com/XERA-2011/XERA-2011"
          target="_blank"
          className="hover:text-neutral-100 transition-colors duration-300 relative group"
        >
          <span>{`© Copyright ${new Date().getFullYear()} `} XERA-2011</span>
          <motion.span
            className="absolute -bottom-1 left-0 w-0 h-[1px] bg-foreground group-hover:w-full"
            transition={{ duration: 0.3 }}
          />
        </Link>
      </div>
    </motion.footer>
  );
}