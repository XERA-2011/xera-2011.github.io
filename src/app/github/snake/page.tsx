'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@radix-ui/react-separator';
import { ExternalLink, Github } from 'lucide-react';

export default function GitHubSnakePage() {
  usePageTitle('GitHub 贪吃蛇');
  const [username, setUsername] = useState('XERA-2011');
  const [isLoading, setIsLoading] = useState(false);
  const [svgContents, setSvgContents] = useState<{ dark: string | null; light: string | null }>({ dark: null, light: null });
  const [error, setError] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError(null);
    setSvgContents({ dark: null, light: null });

    try {
      const [resDark, resLight] = await Promise.all([
        fetch(`/api/github/snake?username=${encodeURIComponent(username)}&theme=dark&v=2`),
        fetch(`/api/github/snake?username=${encodeURIComponent(username)}&theme=light&v=2`)
      ]);

      if (!resDark.ok || !resLight.ok) {
        throw new Error(`HTTP error! status: ${resDark.ok ? resLight.status : resDark.status}`);
      }

      const [textDark, textLight] = await Promise.all([
        resDark.text(),
        resLight.text()
      ]);

      setSvgContents({ dark: textDark, light: textLight });
    } catch (err) {
      console.error('Error generating snake:', err);
      setError(err instanceof Error ? err.message : '生成贪吃蛇动画时出错');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            GitHub 贪吃蛇
          </h1>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>生成贪吃蛇动画</CardTitle>
              <CardDescription>
                输入您的 GitHub 用户名，生成专属的贪吃蛇动画
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">GitHub 用户名</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="输入您的 GitHub 用户名"
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !username.trim()}
                    >
                      {isLoading ? '生成中...' : '生成'}
                    </Button>
                  </div>
                </div>

                {/* 主题选择 */}
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-2">
                    预览主题
                  </Label>
                  <div className="flex gap-2">
                    {(['dark', 'light'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setPreviewTheme(t)}
                        className={`px-4 py-2 rounded-lg border transition-all duration-300 ${previewTheme === t
                          ? 'bg-accent border-ring text-accent-foreground'
                          : 'bg-secondary border-border text-muted-foreground hover:border-ring'
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {svgContents[previewTheme] && (
                  <div className={`mt-6 border rounded-lg overflow-hidden flex justify-center transition-colors duration-300 ${previewTheme === 'dark' ? 'bg-[#0d1117]' : 'bg-white'
                    }`}>
                    <div
                      className="w-full p-4 [&>svg]:w-full [&>svg]:h-auto"
                      dangerouslySetInnerHTML={{ __html: svgContents[previewTheme]! }}
                    />
                  </div>
                )}

                <Separator />

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">使用说明</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start">
                        <Github className="h-4 w-4 mt-0.5 mr-2 shrink-0" />
                        <span>输入有效的 GitHub 用户名</span>
                      </li>
                      <li className="flex items-start">
                        <ExternalLink className="h-4 w-4 mt-0.5 mr-2 shrink-0" />
                        <span>生成基于您贡献图的贪吃蛇动画</span>
                      </li>
                      <li className="flex items-start">
                        <ExternalLink className="h-4 w-4 mt-0.5 mr-2 shrink-0" />
                        <span>
                          核心算法基于{' '}
                          <a
                            href="https://github.com/Platane/snk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Platane/snk
                          </a>
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* 使用方法部分 */}
                  <div className="space-y-4">
                    <h3 className="font-medium">使用方法</h3>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        将以下代码复制到你的 GitHub README.md 文件中：
                      </p>
                      <div className="relative">
                        <pre className="bg-secondary border border-border rounded-lg p-4 overflow-x-auto pr-24">
                          <code className="text-sm text-foreground">
                            {`<img alt="GitHub Snake" src="https://xera-2011.vercel.app/api/github/snake?username=${username}&theme=${previewTheme}" />`}
                          </code>
                        </pre>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(`<img alt="GitHub Snake" src="https://xera-2011.vercel.app/api/github/snake?username=${username}&theme=${previewTheme}" />`, 0)}
                          className="absolute top-2 right-2 h-8"
                        >
                          {copiedIndex === 0 ? (
                            <>
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              已复制
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              复制
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-foreground font-semibold mb-2">可用参数：</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                        <li><code className="text-foreground bg-accent px-2 py-0.5 rounded">username</code> - GitHub 用户名（必需）</li>
                        <li><code className="text-foreground bg-accent px-2 py-0.5 rounded">theme</code> - 主题（dark, light）</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}