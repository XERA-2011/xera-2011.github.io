'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MarkdownPage } from '@/components/MarkdownPage';
import { usePageTitle } from '@/hooks/use-page-title';

function SecurityAuditPage() {
  usePageTitle('安全审计报告');
  const [markdownContent, setMarkdownContent] = useState('');

  useEffect(() => {
    fetch('/markdown/security-audit-report.md')
      .then(res => res.text())
      .then(text => setMarkdownContent(text))
      .catch(() => setMarkdownContent('# 加载失败\n\n无法加载安全审计报告内容，请稍后重试。'));
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
            安全审计报告
          </h2>
        </motion.div>

        <MarkdownPage content={markdownContent} maxWidth="max-w-5xl" />
      </div>
    </div>
  );
}

export default SecurityAuditPage;
