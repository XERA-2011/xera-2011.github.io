"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./body.module.scss";
import { blur, translate } from "../anim";
import { Link as LinkType } from "../config";
import { cn } from "@/utils/cn";
import { usePathname } from "next/navigation";

interface SelectedLink {
  isActive: boolean;
  index: number;
}

interface BodyProps {
  links: LinkType[];
  selectedLink: SelectedLink;
  setSelectedLink: (selectedLink: SelectedLink) => void;
  setIsActive: (isActive: boolean) => void;
}

export default function Body({
  links,
  selectedLink,
  setSelectedLink,
  setIsActive,
}: BodyProps) {
  const pathname = usePathname();
  const [currentHref, setCurrentHref] = useState("/");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { pathname, hash } = window.location;
    setCurrentHref(pathname + hash);
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
    <div className={cn(styles.body, "flex flex-col items-end md:flex-row")}>
      {links.map((link, index) => {
        const { title, href, target } = link;
        const isActive = currentHref === href || (href !== '/' && currentHref.startsWith(href));

        return (
          <Link
            key={`l_${index}`}
            href={href}
            target={target}
            className="rounded-lg"
          >
            <motion.p
              className={cn(
                "rounded-lg",
                "cursor-can-hover",
                isActive ? "underline" : "opacity-60"
              )}
              onClick={() => setIsActive(false)}
              onMouseOver={() => setSelectedLink({ isActive: true, index })}
              onMouseLeave={() => setSelectedLink({ isActive: false, index })}
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
