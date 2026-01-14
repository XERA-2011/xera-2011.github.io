'use client';

import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GithubIcon } from '@/components/icons/github-icon';
import { ExternalLink, Globe } from 'lucide-react';

const platforms = [
  {
    name: 'Cloudflare Pages',
    url: 'https://x-texas-holdem.pages.dev/',
    description: '推荐访问',
    primary: true,
  },
  {
    name: 'Vercel',
    url: 'https://x-texas-holdem.vercel.app/',
    description: '备用地址',
  },
  {
    name: 'GitHub Pages',
    url: 'https://xera-2011.github.io/x-texas-holdem/',
    description: '稳定版本',
  },
];

export default function TexasHoldemPage() {
  usePageTitle('德州扑克');

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
            X Texas Hold&apos;em ♥️♠️♦️♣️
          </h2>
        </motion.div>

        {/* Platforms Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-6 h-6" />
                访问地址
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {platforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      block p-4 rounded-lg border transition-all duration-200
                      hover:border-primary hover:bg-primary/5
                      ${platform.primary
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 bg-background/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{platform.name}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{platform.description}</p>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Source Code Card */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent>
              <a
                href="https://github.com/XERA-2011/x-texas-holdem"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <GithubIcon className="w-5 h-5" />
                XERA-2011/x-texas-holdem
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
