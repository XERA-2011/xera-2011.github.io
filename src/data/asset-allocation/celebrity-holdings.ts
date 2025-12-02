// 名人持仓数据类型
export interface CelebrityAsset {
  id: string;
  name: string;
  percentage: number; // 持仓占比百分比（如 12.70 表示 12.70%）
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  assets: CelebrityAsset[];
  createdAt: string;
  updatedAt: string;
  isReadOnly: boolean;
}

// 名人持仓数据
export const CELEBRITY_HOLDINGS: Portfolio[] = [
  {
    id: 'buffett',
    name: '巴菲特持仓参考',
    description: '基于伯克希尔·哈撒韦公开持仓（2025Q3 13F，股票组合约2673亿美元）',
    assets: [
      { id: '1', name: '苹果 (AAPL)', percentage: 22.69 },
      { id: '2', name: '美国运通 (AXP)', percentage: 18.84 },
      { id: '3', name: '美国银行 (BAC)', percentage: 10.96 },
      { id: '4', name: '可口可乐 (KO)', percentage: 9.92 },
      { id: '5', name: '雪佛龙 (CVX)', percentage: 7.09 },
      { id: '6', name: 'Chubb (CB)', percentage: 3.31 },
      { id: '7', name: 'Kraft Heinz (KHC)', percentage: 3.17 },
      { id: '8', name: '现金及短期国债', percentage: 19.60 },
      { id: '9', name: 'Alphabet (GOOGL)', percentage: 1.62 },
      { id: '10', name: 'DaVita (DVA)', percentage: 1.60 },
      { id: '11', name: 'Citigroup (C)', percentage: 1.20 },
    ],
    createdAt: '2025-09-30',
    updatedAt: '2025-11-18',
    isReadOnly: true,
  },
  {
    id: 'cathie',
    name: '木头姐持仓参考',
    description: '基于 ARK Invest (ARKK) 旗舰基金持仓（2025Q3 权重更新）',
    assets: [
      { id: '1', name: 'Tesla (TSLA)', percentage: 12.70 },
      { id: '2', name: 'Coinbase (COIN)', percentage: 5.82 },
      { id: '3', name: 'Roku (ROKU)', percentage: 5.79 },
      { id: '4', name: 'Roblox (RBLX)', percentage: 5.40 },
      { id: '5', name: 'CRISPR Therapeutics (CRSP)', percentage: 5.13 },
      { id: '6', name: 'Shopify (SHOP)', percentage: 4.81 },
      { id: '7', name: 'Tempus AI (TEM)', percentage: 4.78 },
      { id: '8', name: 'Palantir (PLTR)', percentage: 4.34 },
      { id: '9', name: 'UiPath (PATH)', percentage: 3.85 },
      { id: '10', name: 'Block (SQ)', percentage: 3.50 },
      { id: '11', name: '其他持仓', percentage: 43.88 },
    ],
    createdAt: '2025-09-30',
    updatedAt: '2025-11-18',
    isReadOnly: true,
  },
  {
    id: 'duan',
    name: '段永平持仓参考',
    description: '基于 H&H International Investment 公开持仓（2025Q3 13F）',
    assets: [
      { id: '1', name: '苹果 (AAPL)', percentage: 60.42 },
      { id: '2', name: '伯克希尔B股 (BRK.B)', percentage: 17.78 },
      { id: '3', name: '拼多多 (PDD)', percentage: 7.72 },
      { id: '4', name: '西方石油 (OXY)', percentage: 4.36 },
      { id: '5', name: '阿里巴巴 (BABA)', percentage: 3.38 },
      { id: '6', name: 'Alphabet (GOOGL)', percentage: 3.00 },
      { id: '7', name: '微软 (MSFT)', percentage: 0.99 },
      { id: '8', name: '英伟达 (NVDA)', percentage: 0.76 },
      { id: '9', name: '迪士尼 (DIS)', percentage: 0.56 },
      { id: '10', name: 'ASML Holding (ASML)', percentage: 0.53 },
      { id: '11', name: '其他持仓', percentage: 0.50 },
    ],
    createdAt: '2025-09-30',
    updatedAt: '2025-11-14',
    isReadOnly: true,
  },
  {
    id: 'pelosi',
    name: '佩洛西概念参考',
    description: '基于 2024-2025 国会交易披露 (PTR)，估算核心活跃持仓',
    assets: [
      { id: '1', name: 'Nvidia (NVDA)', percentage: 25.00 },
      { id: '2', name: 'Microsoft (MSFT)', percentage: 18.00 },
      { id: '3', name: 'Broadcom (AVGO)', percentage: 12.00 },
      { id: '4', name: 'Alphabet (GOOGL)', percentage: 10.00 },
      { id: '5', name: 'Palo Alto Networks (PANW)', percentage: 8.00 },
      { id: '6', name: 'Amazon (AMZN)', percentage: 8.00 },
      { id: '7', name: 'Apple (AAPL)', percentage: 5.00 },
      { id: '8', name: 'Tempus AI (TEM)', percentage: 3.00 },
      { id: '9', name: 'Visa (V)', percentage: 3.00 },
      { id: '10', name: 'Vistra (VST)', percentage: 2.00 },
      { id: '11', name: '其他持仓', percentage: 6.00 },
    ],
    createdAt: '2025-10-24',
    updatedAt: '2025-11-20',
    isReadOnly: true,
  },
  {
    id: 'soros',
    name: '索罗斯持仓参考',
    description: '基于 Soros Fund Management 公开持仓（2025Q3 13F）',
    assets: [
      { id: '1', name: 'Amazon (AMZN)', percentage: 6.96 },
      { id: '2', name: 'Smurfit Westrock (SW)', percentage: 4.70 },
      { id: '3', name: 'Spotify (SPOT)', percentage: 3.61 },
      { id: '4', name: 'Alphabet (GOOGL)', percentage: 2.28 },
      { id: '5', name: 'Invesco S&P 500 EW ETF (RSP)', percentage: 2.24 },
      { id: '6', name: 'Global Payments (Convertible)', percentage: 1.96 },
      { id: '7', name: 'VanEck Semi ETF (SMH Put)', percentage: 1.44 },
      { id: '8', name: 'Kraneshares China Inet (Call)', percentage: 1.44 },
      { id: '9', name: 'Apple (AAPL)', percentage: 1.27 },
      { id: '10', name: 'iShares 20+ Treasury (TLT Call)', percentage: 1.27 },
      { id: '11', name: '其他持仓', percentage: 72.83 },
    ],
    createdAt: '2025-09-30',
    updatedAt: '2025-11-14',
    isReadOnly: true,
  },
];
