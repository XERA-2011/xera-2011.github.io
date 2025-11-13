"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SectionConfig {
  id: string;
  offset?: number; // 触发位置的偏移量（百分比）
}

/**
 * 监听滚动并更新 URL hash
 * @param sections - section 配置数组
 */
export function useScrollHash(sections: SectionConfig[]) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    let ticking = false;

    const updateHash = (sectionId: string) => {
      const hash = sectionId === sections[0].id ? '#' : `#${sectionId}`;

      // 只在 hash 改变时才更新 URL
      if (window.location.hash !== hash) {
        router.push(hash, { scroll: false });
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + window.innerHeight / 2;

          // 从后往前遍历，找到第一个在视口中的 section
          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const element = document.getElementById(section.id);

            if (element) {
              const rect = element.getBoundingClientRect();
              const elementTop = rect.top + window.scrollY;
              const offset = section.offset || 0.3; // 默认 30% 的位置触发
              const triggerPoint = elementTop + (rect.height * offset);

              if (scrollPosition >= triggerPoint) {
                if (activeSection !== section.id) {
                  setActiveSection(section.id);
                  updateHash(section.id);
                }
                break;
              }
            }
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    // 初始化时检查一次
    handleScroll();

    // 监听滚动
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections, activeSection, router]);

  return activeSection;
}
