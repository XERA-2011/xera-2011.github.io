"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, FileText } from 'lucide-react';
import { GithubIcon } from '@/components/icons/github-icon';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="relative bottom-0 w-full py-2 px-4 sm:px-6 lg:px-8 text-sm text-muted-foreground"
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-6">
          <Link
            href="https://github.com/XERA-2011"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-can-hover text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            title="GitHub"
            aria-label="GitHub"
          >
            <GithubIcon className="w-5 h-5" />
            <motion.span
              className="absolute -bottom-1 left-0 w-0 h-px bg-foreground group-hover:w-full"
              transition={{ duration: 0.3 }}
            />
          </Link>

          <Link
            href="/privacy"
            className="cursor-can-hover text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            title="Privacy Policy"
            aria-label="Privacy Policy"
          >
            <Shield className="w-5 h-5" />
            <motion.span
              className="absolute -bottom-1 left-0 w-0 h-px bg-foreground group-hover:w-full"
              transition={{ duration: 0.3 }}
            />
          </Link>

          <Link
            href="/terms"
            className="cursor-can-hover text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            title="Terms of Service"
            aria-label="Terms of Service"
          >
            <FileText className="w-5 h-5" />
            <motion.span
              className="absolute -bottom-1 left-0 w-0 h-px bg-foreground group-hover:w-full"
              transition={{ duration: 0.3 }}
            />
          </Link>
        </div>

        <div className="text-muted-foreground text-xs">
          {`© Copyright ${new Date().getFullYear()} `}
          <Link
            href="https://github.com/XERA-2011"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-can-hover text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            XERA-2011
          </Link>
        </div>
      </div>
    </motion.footer>
  );
}