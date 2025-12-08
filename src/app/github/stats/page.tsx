'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { usePageTitle } from '@/hooks/use-page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GithubIcon } from '@/components/icons/github-icon';
import Image from 'next/image';

export default function GitHubStatsPage() {
  usePageTitle('GitHub Stats');
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (resolvedTheme || theme || 'dark') : 'dark';
  const isDark = currentTheme === 'dark';

  const cdnBase = "https://cdn.jsdelivr.net/gh/XERA-2011/x-actions@output";
  const statsDark = `/api/redirect?url=${encodeURIComponent(`${cdnBase}/stats-dark.svg`)}`;
  const statsLight = `/api/redirect?url=${encodeURIComponent(`${cdnBase}/stats-light.svg`)}`;

  const currentSrc = isDark ? statsDark : statsLight;

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            GitHub Stats Card
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            展示你的 GitHub 统计数据卡片。
            <br />
            现在通过 GitHub Actions 自动生成。
          </p>
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
                生成结果预览
              </CardTitle>
              <CardDescription>
                每天自动更新，位于 public/charts 目录
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{isDark ? 'Dark Theme' : 'Light Theme'}</h3>
                <div className={`relative w-full aspect-495/195 rounded-lg overflow-hidden border ${isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#e1e4e8]'}`}>
                  <Image
                    key={currentTheme}
                    src={currentSrc}
                    alt={`GitHub Stats ${isDark ? 'Dark' : 'Light'}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>如何使用</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                本项目使用自定义的 GitHub Action <code>x-actions</code> 来生成图表。
                配置位于 <code>.github/workflows/x-charts.yml</code>。
              </p>
              <div className="bg-muted p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">
                  {`uses: ./x-actions
with:
  token: \${{ secrets.GITHUB_TOKEN }}
  user: \${{ github.repository_owner }}
  output_dir: public/charts
  types: snake,stats,top-langs`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
