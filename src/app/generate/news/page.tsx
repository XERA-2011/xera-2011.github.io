'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { type Components } from 'react-markdown';
import { MarkdownPage } from '@/components/MarkdownPage';
import { usePageTitle } from '@/hooks/use-page-title';

function NewsPage() {
  usePageTitle('新闻');
  const [markdownContent, setMarkdownContent] = useState('');

  useEffect(() => {
    fetch('/markdown/daily-news.md')
      .then(res => res.text())
      .then(text => setMarkdownContent(text))
      .catch(() => setMarkdownContent('# 加载失败\n\n无法加载新闻内容，请稍后重试。'));
  }, []);

  // 自定义 h1 样式（居中显示）
  const customComponents: Components = {
    h1: ({ ...props }) => <h1 className="text-3xl font-bold mb-6 text-center" {...props} />,
  };

  return (
    <div className="relative w-full min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            新闻
          </h2>
        </motion.div>

        <MarkdownPage
          content={markdownContent}
          maxWidth="max-w-5xl"
          customComponents={customComponents}
        />
      </div>
    </div>
  );
}

export default NewsPage;