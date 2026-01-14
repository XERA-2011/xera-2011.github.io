'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { usePageTitle } from '@/hooks/use-page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GithubIcon } from '@/components/icons/github-icon';
import { useHasMounted } from '@/hooks/use-has-mounted';

export default function XActionsProfilePage() {
  usePageTitle('X Actions Profile');
  const { theme, resolvedTheme } = useTheme();
  const mounted = useHasMounted();

  const getThemeSrc = (name: string) => {
    const currentTheme = mounted ? (resolvedTheme || theme || 'dark') : 'dark';
    const filename = `${name}-${currentTheme === 'light' ? 'light' : 'dark'}.svg`;
    return `/api/redirect?url=${encodeURIComponent(
      `https://cdn.jsdelivr.net/gh/XERA-2011/x-actions-profile@output/${filename}`
    )}`;
  };

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
            <CardContent className="space-y-8">
              {/* Snake Animation */}
              <div className="flex justify-center">
                <Image
                  alt="github-snake"
                  src={getThemeSrc('snake')}
                  width={800}
                  height={200}
                  className="w-full max-w-3xl h-auto"
                  style={{ width: "auto", height: "auto" }}
                  unoptimized
                  priority
                />
              </div>

              {/* Language Stats */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {['top-langs-donut', 'top-langs-cloud', 'top-langs-compact', 'top-langs'].map((name) => (
                  <Image
                    key={name}
                    alt={name}
                    src={getThemeSrc(name)}
                    width={400}
                    height={300}
                    className="h-auto max-w-full object-contain"
                    style={{ width: "auto", height: "auto" }}
                    unoptimized
                  />
                ))}
              </div>

              {/* General Stats */}
              <div className="flex justify-center">
                <Image
                  alt="github-stats"
                  src={getThemeSrc('stats')}
                  width={800}
                  height={400}
                  className="w-full max-w-3xl h-auto"
                  style={{ width: "auto", height: "auto" }}
                  unoptimized
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}