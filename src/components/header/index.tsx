"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import styles from "./style.module.scss";
import { background } from "./anim";
import Nav from "./nav";
import { cn } from "@/utils/cn";
import Breadcrumb from "./Breadcrumb";
import { useApp } from "@/contexts/AppContext";

interface HeaderProps {
  loader?: boolean;
}

const Header = ({ loader }: HeaderProps) => {
  const { isMenuActive: isActive, setIsMenuActive: setIsActive } = useApp();

  return (
    <motion.header
      className={cn(
        styles.header,
        "transition-colors delay-100 duration-500 ease-in"
      )}
      style={{
        background: isActive ? "rgba(0, 0, 0, 0.8)" : "transparent",
      }}
      initial={{
        y: -80,
      }}
      animate={{
        y: 0,
      }}
      transition={{
        delay: loader ? 3.5 : 0,
        duration: 0.8,
      }}
    >
      <div
        className={cn(styles.bar, "flex items-center justify-between")}
        onClick={() => isActive && setIsActive(false)}
      >
        <Breadcrumb />

        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/XERA-2011"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-can-hover flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
            aria-label="GitHub"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </Link>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsActive(!isActive);
            }}
            className={cn(
              styles.el,
              "m-0 p-0 h-6 bg-transparent flex items-center justify-center border-none",
              !isActive && "cursor-can-hover"
            )}
          >
            <div
              className={`${styles.burger} ${isActive ? styles.burgerActive : ""
                }`}
            ></div>
          </button>
        </div>
      </div>

      <motion.div
        variants={background}
        initial="initial"
        animate={isActive ? "open" : "closed"}
        className={styles.background}
      ></motion.div>

      <AnimatePresence mode="wait">
        {isActive && <Nav setIsActive={setIsActive} />}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
