"use client";

import React, { useMemo, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./body.module.scss";
import { blur, translate } from "../anim";
import { Link as LinkType } from "../config";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

interface SelectedLink {
  isActive: boolean;
  index: number;
}

interface BodyProps {
  links: LinkType[];
  selectedLink: SelectedLink;
  setSelectedLink: (selectedLink: SelectedLink) => void;
  setIsActive: (isActive: boolean) => void;
  userAuth?: ReactNode;
}

export default function Body({
  links,
  selectedLink,
  setSelectedLink,
  setIsActive,
  userAuth,
}: BodyProps) {
  const pathname = usePathname();

  // 使用 useMemo 计算当前完整路径，依赖 pathname 变化时重新计算
  // 注意: hash 在客户端才有，所以这里只用 pathname
  const currentHref = useMemo(() => {
    if (typeof window === "undefined") return pathname;
    return pathname + window.location.hash;
  }, [pathname]);

  const getChars = (word: string) => {
    const chars: React.ReactElement[] = [];
    word.split("").forEach((char, i) => {
      chars.push(
        <motion.span
          className="pointer-events-none"
          custom={[i * 0.02, (word.length - i) * 0.01]}
          variants={translate}
          initial="initial"
          animate="enter"
          exit="exit"
          key={char + i}
        >
          {char}
        </motion.span>
      );
    });
    return chars;
  };

  return (
    <div className={cn(styles.body, "flex flex-col items-end md:flex-row gap-6 md:gap-12")}>
      {/* Mobile Settings Block - Aligned with links */}
      <motion.div
        custom={[0, 0]}
        variants={translate}
        initial="initial"
        animate="enter"
        exit="exit"
        className="flex items-center justify-end gap-4 md:hidden w-full"
      >
        <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center">
          <ThemeToggle />
        </div>
        {userAuth && (
          <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center">
            {userAuth}
          </div>
        )}
      </motion.div>
      {links.map((link, index) => {
        const { title, href, target } = link;
        const isActive = currentHref === href || (href !== '/' && currentHref.startsWith(href));

        return (
          <Link
            key={`l_${index}`}
            href={href}
            target={target}
            className="rounded-lg"
            onClick={() => setIsActive(false)}
          >
            <motion.p
              className={cn(
                "rounded-lg",
                "cursor-can-hover",
                isActive ? "underline" : "opacity-60"
              )}
              onMouseOver={() => {
                if (window.innerWidth > 768) {
                  setSelectedLink({ isActive: true, index });
                }
              }}
              onMouseLeave={() => {
                if (window.innerWidth > 768) {
                  setSelectedLink({ isActive: false, index });
                }
              }}
              variants={blur}
              animate={
                selectedLink.isActive && selectedLink.index !== index
                  ? "open"
                  : "closed"
              }
            >
              {getChars(title)}
            </motion.p>
          </Link>
        );
      })}
    </div>
  );
}
