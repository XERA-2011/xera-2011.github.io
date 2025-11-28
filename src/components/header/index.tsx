"use client";

import { motion, AnimatePresence } from "framer-motion";
import styles from "./style.module.scss";
import { background } from "./anim";
import Nav from "./nav";
import { cn } from "@/lib/utils";
import Breadcrumb from "./breadcrumb";
import { useApp } from "@/contexts/AppContext";
import { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  loader?: boolean;
  userAuth?: ReactNode;
}

const Header = ({ loader, userAuth }: HeaderProps) => {
  const { isMenuActive: isActive, setIsMenuActive: setIsActive } = useApp();

  return (
    <motion.header
      className={cn(
        styles.header,
        "transition-colors delay-100 duration-500 ease-in",
        isActive && "bg-background/80"
      )}
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
          {userAuth}

          <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center cursor-can-hover">
            <ThemeToggle />
          </div>

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
