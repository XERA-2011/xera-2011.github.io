'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MarkdownPage } from '@/components/MarkdownPage';
import { usePageTitle } from '@/hooks/use-page-title';

function MarkdownPreviewPage() {
  usePageTitle('PET3作文');
  const [markdownContent, setMarkdownContent] = useState('');

  useEffect(() => {
    fetch('/markdown/pet-essays.md')
      .then(res => res.text())
      .then(text => setMarkdownContent(text))
      .catch(() => setMarkdownContent('# 加载失败\n\n无法加载作文内容，请稍后重试。'));
  }, []);

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
            PET3作文
          </h2>
        </motion.div>

        <MarkdownPage
          content={markdownContent}
          maxWidth="max-w-4xl"
        />
      </div>
    </div>
  );
}

export default MarkdownPreviewPage;