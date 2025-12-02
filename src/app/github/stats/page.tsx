"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePageTitle } from '@/hooks/use-page-title';
import GlowCard from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';

export default function GitHubStatsPage() {
  usePageTitle('GitHub Stats');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [username, setUsername] = useState('XERA-2011');
  const [theme, setTheme] = useState('dark');

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const baseUrl = 'https://xera-2011.vercel.app';
  const exampleCode = `<img alt="GitHub Stats" src="${baseUrl}/api/github/stats?username=${username}&theme=${theme}" />`;

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            GitHub Stats Card
          </h2>
        </motion.div>

        {/* Interactive Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlowCard className="p-6 sm:p-8 mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">实时预览</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  GitHub 用户名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-ring transition-colors duration-300"
                  placeholder="输入 GitHub 用户名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  主题
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['dark', 'light', 'radical', 'merko'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-4 py-2 rounded-lg border transition-all duration-300 ${theme === t
                        ? 'bg-accent border-ring text-accent-foreground'
                        : 'bg-secondary border-border text-muted-foreground hover:border-ring'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center bg-secondary border border-border rounded-lg p-8 mt-6" style={{ minHeight: '350px' }}>
                <Image
                  src={`/api/github/stats?username=${username}&theme=${theme}&v=2`}
                  alt="GitHub Stats Preview"
                  key={`${username}-${theme}`}
                  width={450}
                  height={350}
                  style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                  unoptimized
                />
              </div>
            </div>
          </GlowCard>
        </motion.div>

        {/* Examples */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <GlowCard className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">使用方法</h2>

            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                将以下代码复制到你的 GitHub README.md 文件中：
              </p>

              {/* Code Block with Copy Button */}
              <div className="relative">
                <pre className="bg-secondary border border-border rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-foreground">{exampleCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(exampleCode, 0)}
                  className="absolute top-2 right-2"
                >
                  {copiedIndex === 0 ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      已复制
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      复制
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border space-y-4">
              <div>
                <p className="text-base text-foreground font-semibold mb-3">可用参数：</p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
                  <li><code className="text-foreground bg-accent px-2 py-0.5 rounded">username</code> - GitHub 用户名（必需）</li>
                  <li><code className="text-foreground bg-accent px-2 py-0.5 rounded">theme</code> - 主题（dark, light, radical, merko）</li>
                  <li><code className="text-foreground bg-accent px-2 py-0.5 rounded">hide_title</code> - 隐藏标题</li>
                  <li><code className="text-foreground bg-accent px-2 py-0.5 rounded">hide_border</code> - 隐藏边框</li>
                </ul>
              </div>

              <div>
                <p className="text-base text-foreground font-semibold mb-3">统计数据包括：</p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
                  <li>Total Stars - 所有仓库获得的星标总数</li>
                  <li>Total Commits - 总提交次数（估算）</li>
                  <li>Total PRs - 总 Pull Request 数量（估算）</li>
                  <li>Total Issues - 总 Issue 数量（估算）</li>
                  <li>Contributed to - 贡献过的仓库数量</li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-200/80">
                  <strong>💡 提示：</strong> 为了获得更好的 API 访问速率，建议在环境变量中配置 <code className="text-yellow-200 bg-yellow-500/20 px-2 py-0.5 rounded">GITHUB_TOKEN</code>
                </p>
              </div>
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}
