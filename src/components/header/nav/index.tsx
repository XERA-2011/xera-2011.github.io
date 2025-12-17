"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./style.module.scss";
import { height } from "../anim";
import Body from "./body";
import { links } from "../config";
import { useSession } from "next-auth/react";

interface IndexProps {
  setIsActive: (isActive: boolean) => void;
}

interface SelectedLinkState {
  isActive: boolean;
  index: number;
}

const Nav: React.FC<IndexProps> = ({ setIsActive }) => {
  const [selectedLink, setSelectedLink] = useState<SelectedLinkState>({
    isActive: false,
    index: 0,
  });
  const { data: session } = useSession();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsActive(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsActive]);

  const isAdmin = !!session?.user?.isAdmin;

  return (
    <div onClick={() => setIsActive(false)} className={styles.nav}>
      <motion.div
        variants={height}
        initial="initial"
        animate="enter"
        exit="exit"
        className={styles.navInner}
      >
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <Body
              links={links.filter((link) => !link.adminOnly || isAdmin)}
              selectedLink={selectedLink}
              setSelectedLink={setSelectedLink}
              setIsActive={setIsActive}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Nav;
