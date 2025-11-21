"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="relative bottom-0 w-full py-3 px-4 sm:px-6 lg:px-8 text-sm text-muted-foreground"
    >
      <div className="flex items-center justify-center flex-wrap gap-4">
        <div className="text-muted-foreground">
          {`© Copyright ${new Date().getFullYear()} `}
          <Link
            href="https://github.com/XERA-2011/XERA-2011"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-can-hover text-muted-foreground hover:text-foreground transition-colors duration-300 relative group inline-block"
          >
            <span>XERA-2011</span>
            <motion.span
              className="absolute -bottom-1 left-0 w-0 h-[1px] bg-foreground group-hover:w-full"
              transition={{ duration: 0.3 }}
            />
          </Link>
        </div>
        <span className="text-muted-foreground">•</span>
        <Link
          href="/privacy"
          className="cursor-can-hover text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
        >
          <span>Privacy Policy</span>
          <motion.span
            className="absolute -bottom-1 left-0 w-0 h-[1px] bg-foreground group-hover:w-full"
            transition={{ duration: 0.3 }}
          />
        </Link>
        <span className="text-muted-foreground">•</span>
        <Link
          href="/terms"
          className="cursor-can-hover text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
        >
          <span>Terms of Service</span>
          <motion.span
            className="absolute -bottom-1 left-0 w-0 h-[1px] bg-foreground group-hover:w-full"
            transition={{ duration: 0.3 }}
          />
        </Link>
      </div>
    </motion.footer>
  );
}