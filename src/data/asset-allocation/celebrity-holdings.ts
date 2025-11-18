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
    description: '基于伯克希尔·哈撒韦公开持仓（2025Q3，股票组合约2673亿美元）',
    assets: [
      { id: '1', name: '苹果 (AAPL)', amount: 22.69 },
      { id: '2', name: '美国运通 (AXP)', amount: 18.84 },
      { id: '3', name: '美国银行 (BAC)', amount: 10.96 },
      { id: '4', name: '可口可乐 (KO)', amount: 9.92 },
      { id: '5', name: '雪佛龙 (CVX)', amount: 7.09 },
      { id: '6', name: 'Chubb (CB)', amount: 3.31 },
      { id: '7', name: 'Alphabet (GOOGL)', amount: 1.62 },
      { id: '8', name: 'DaVita (DVA)', amount: 1.60 },
      { id: '9', name: 'Amazon (AMZN)', amount: 0.82 },
      { id: '10', name: 'Constellation Brands (STZ)', amount: 0.68 },
      { id: '11', name: '现金及短期国债', amount: 31.00 },
    ],
    createdAt: '2025-09-30',
    updatedAt: '2025-11-18',
    isReadOnly: true,
  },
  {
    id: 'cathie',
    name: '木头姐持仓参考',
    description: '基于 ARK Invest 聚合持仓（2025Q3，总投资组合约168亿美元）',
    assets: [
      { id: '1', name: 'Tesla (TSLA)', amount: 9.50 },
      { id: '2', name: 'Coinbase (COIN)', amount: 4.81 },
      { id: '3', name: 'Roku (ROKU)', amount: 4.38 },
      { id: '4', name: 'Palantir (PLTR)', amount: 4.38 },
      { id: '5', name: 'Roblox (RBLX)', amount: 4.38 },
      { id: '6', name: '其他前10大持仓', amount: 18.71 },
      { id: '7', name: '其他股票', amount: 53.64 },
      { id: '8', name: '现金及等价物', amount: 0.20 },
    ],
    createdAt: '2025-09-30',
    updatedAt: '2025-11-18',
    isReadOnly: true,
  },
];
