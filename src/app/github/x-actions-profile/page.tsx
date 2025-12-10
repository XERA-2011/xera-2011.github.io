'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePageTitle } from '@/hooks/use-page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GithubIcon } from '@/components/icons/github-icon';
import { MarkdownPage } from '@/components/markdown-page';
import { Loader2 } from 'lucide-react';

export default function XActionsProfilePage() {
  usePageTitle('X Actions Profile');
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        setLoading(true);
        setError(null);

        // 使用 API 代理获取 GitHub README 内容
        const readmeUrl = 'https://raw.githubusercontent.com/XERA-2011/x-actions-profile/main/README.md';
        const proxyUrl = `/api/redirect?url=${encodeURIComponent(readmeUrl)}&cache=3600`;

        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch README: ${response.status}`);
        }

        const content = await response.text();
        setMarkdownContent(content);
      } catch (err) {
        console.error('Error fetching README:', err);
        setError(err instanceof Error ? err.message : 'Failed to load README');
      } finally {
        setLoading(false);
      }
    };

    fetchReadme();
  }, []);

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            X Actions Profile
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GithubIcon className="w-6 h-6" />
                项目文档
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                来自 GitHub 仓库的 README 文档
                <a
                  href="https://github.com/XERA-2011/x-actions-profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  查看源代码
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">加载中...</span>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-destructive mb-4">加载失败: {error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    重试
                  </button>
                </div>
              )}

              {!loading && !error && markdownContent && (
                <MarkdownPage
                  content={markdownContent}
                  withContainer={false}
                  maxWidth="max-w-none"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}