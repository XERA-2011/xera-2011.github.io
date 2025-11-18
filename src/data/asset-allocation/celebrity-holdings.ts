// 名人持仓数据类型
export interface Asset {
  id: string;
  name: string;
  amount: number;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
  isReadOnly: boolean;
}

// 名人持仓数据
export const CELEBRITY_HOLDINGS: Portfolio[] = [
  {
    id: 'buffett',
    name: '巴菲特持仓参考',
    description: '基于伯克希尔·哈撒韦公开持仓（2024Q3）',
    assets: [
      { id: '1', name: '苹果 (AAPL)', amount: 26.2 },
      { id: '2', name: '美国银行 (BAC)', amount: 10.5 },
      { id: '3', name: '美国运通 (AXP)', amount: 15.4 },
      { id: '4', name: '可口可乐 (KO)', amount: 10.8 },
      { id: '5', name: '雪佛龙 (CVX)', amount: 7.3 },
      { id: '6', name: '西方石油 (OXY)', amount: 6.7 },
      { id: '7', name: '穆迪 (MCO)', amount: 4.8 },
      { id: '8', name: '达美乐披萨 (DPZ)', amount: 3.7 },
      { id: '9', name: '现金及其他', amount: 14.6 },
    ],
    createdAt: '2024-09-30',
    updatedAt: '2024-11-18',
    isReadOnly: true,
  },
  {
    id: 'cathie',
    name: '木头姐持仓参考',
    description: '基于 ARK Innovation ETF (ARKK) 主要持仓',
    assets: [
      { id: '1', name: 'Coinbase (COIN)', amount: 10.2 },
      { id: '2', name: 'Roku (ROKU)', amount: 8.9 },
      { id: '3', name: 'Tesla (TSLA)', amount: 8.1 },
      { id: '4', name: 'Block (SQ)', amount: 6.5 },
      { id: '5', name: 'Roblox (RBLX)', amount: 5.7 },
      { id: '6', name: 'Shopify (SHOP)', amount: 4.8 },
      { id: '7', name: 'UiPath (PATH)', amount: 4.3 },
      { id: '8', name: 'Zoom (ZM)', amount: 3.9 },
      { id: '9', name: 'Unity (U)', amount: 3.2 },
      { id: '10', name: '其他科技股', amount: 44.4 },
    ],
    createdAt: '2024-11-15',
    updatedAt: '2024-11-18',
    isReadOnly: true,
  },
];
