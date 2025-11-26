"use client";

import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import CoinPrice from '@/components/ui/CoinPrice';
import GlowCard from '@/components/ui/GlowCard';
import { MarkdownPage } from '@/components/MarkdownPage';

export default function CoinPage() {
  usePageTitle('Crypto Prices');

  const apiDoc = `## API Usage

### 查询单个币种价格

\`\`\`
GET /api/coin?coin=btc
\`\`\`

### 查询多个币种价格

\`\`\`
GET /api/coin?coin=btc,eth,sol
\`\`\`

### 示例响应

\`\`\`json
{
  "btc": {
    "symbol": "BTC",
    "name": "Bitcoin",
    "price": 45000.00,
    "currency": "USD",
    "lastUpdated": 1700000000000,
    "change24h": 2.5
  }
}
\`\`\`

### 支持的币种

BTC、ETH、ETC、BNB、SOL、USDT、XRP、ADA、DOGE、TRX 等

---

## 在 Markdown 中使用

可以直接在 Markdown 文件中嵌入 SVG 卡片：

### 单币种卡片

\`\`\`markdown
![BTC Price](https://yoursite.com/api/coin-card?coin=btc&mode=single)
\`\`\`

### 多币种卡片

\`\`\`markdown
![Crypto Prices](https://yoursite.com/api/coin-card?coin=btc,eth,sol,bnb&mode=multi)
\`\`\`

### 示例效果

![BTC Price](/api/coin-card?coin=btc&mode=single)
`;

  return (
    <div className="relative w-full min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Cryptocurrency Prices
          </h2>
          <p className="text-white/70 text-base">
            Real-time cryptocurrency price tracking
          </p>
        </motion.div>

        {/* Coin Price Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlowCard className="p-4 sm:p-6">
            <CoinPrice
              coins={['btc', 'eth', 'sol', 'bnb']}
              showControls={true}
              autoRefresh={true}
              refreshInterval={30}
              displayMode="svg"
            />
          </GlowCard>
        </motion.div>

        {/* API Documentation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6"
        >
          <GlowCard className="p-4 sm:p-6">
            <MarkdownPage content={apiDoc} withContainer={false} />
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}
