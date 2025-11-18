import { NextResponse } from 'next/server';

// 名人持仓数据类型
interface Asset {
  id: string;
  name: string;
  amount: number;
  color: string;
}

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
  isReadOnly: boolean;
}

// 名人持仓数据
const CELEBRITY_HOLDINGS: Portfolio[] = [
  {
    id: 'buffett',
    name: '巴菲特持仓参考',
    description: '基于伯克希尔·哈撒韦公开持仓（2024Q3）',
    assets: [
      { id: '1', name: '苹果 (AAPL)', amount: 69.9, color: 'hsl(210, 45%, 60%)' },
      { id: '2', name: '美国银行 (BAC)', amount: 10.1, color: 'hsl(150, 45%, 60%)' },
      { id: '3', name: '美国运通 (AXP)', amount: 8.8, color: 'hsl(30, 45%, 60%)' },
      { id: '4', name: '可口可乐 (KO)', amount: 7.5, color: 'hsl(0, 45%, 60%)' },
      { id: '5', name: '雪佛龙 (CVX)', amount: 3.7, color: 'hsl(270, 45%, 60%)' },
    ],
    createdAt: '2024-09-30',
    updatedAt: '2024-09-30',
    isReadOnly: true,
  },
  {
    id: 'duan',
    name: '段永平持仓参考',
    description: '基于公开信息整理的大致配置',
    assets: [
      { id: '1', name: '苹果 (AAPL)', amount: 40, color: 'hsl(210, 45%, 60%)' },
      { id: '2', name: '茅台', amount: 25, color: 'hsl(0, 45%, 60%)' },
      { id: '3', name: '腾讯', amount: 15, color: 'hsl(180, 45%, 60%)' },
      { id: '4', name: '拼多多 (PDD)', amount: 10, color: 'hsl(280, 45%, 60%)' },
      { id: '5', name: '现金及其他', amount: 10, color: 'hsl(120, 45%, 60%)' },
    ],
    createdAt: '2024-06-30',
    updatedAt: '2024-06-30',
    isReadOnly: true,
  },
  {
    id: 'cathie',
    name: '木头姐持仓参考',
    description: '基于 ARK Innovation ETF (ARKK) 主要持仓',
    assets: [
      { id: '1', name: 'Coinbase (COIN)', amount: 9.8, color: 'hsl(30, 45%, 60%)' },
      { id: '2', name: 'Roku (ROKU)', amount: 8.5, color: 'hsl(270, 45%, 60%)' },
      { id: '3', name: 'Tesla (TSLA)', amount: 7.2, color: 'hsl(0, 45%, 60%)' },
      { id: '4', name: 'Block (SQ)', amount: 6.9, color: 'hsl(210, 45%, 60%)' },
      { id: '5', name: 'UiPath (PATH)', amount: 5.8, color: 'hsl(150, 45%, 60%)' },
      { id: '6', name: '其他科技股', amount: 61.8, color: 'hsl(180, 45%, 60%)' },
    ],
    createdAt: '2024-10-31',
    updatedAt: '2024-10-31',
    isReadOnly: true,
  },
  {
    id: 'dalio',
    name: '达里奥全天候策略',
    description: '桥水基金全天候投资组合参考',
    assets: [
      { id: '1', name: '股票', amount: 30, color: 'hsl(210, 45%, 60%)' },
      { id: '2', name: '长期国债', amount: 40, color: 'hsl(150, 45%, 60%)' },
      { id: '3', name: '中期国债', amount: 15, color: 'hsl(120, 45%, 60%)' },
      { id: '4', name: '大宗商品', amount: 7.5, color: 'hsl(30, 45%, 60%)' },
      { id: '5', name: '黄金', amount: 7.5, color: 'hsl(45, 45%, 60%)' },
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isReadOnly: true,
  },
  {
    id: 'munger',
    name: '查理·芒格持仓参考',
    description: '基于Daily Journal Corporation持仓',
    assets: [
      { id: '1', name: '阿里巴巴 (BABA)', amount: 45, color: 'hsl(30, 45%, 60%)' },
      { id: '2', name: '富国银行 (WFC)', amount: 30, color: 'hsl(210, 45%, 60%)' },
      { id: '3', name: '美国银行 (BAC)', amount: 15, color: 'hsl(150, 45%, 60%)' },
      { id: '4', name: '其他', amount: 10, color: 'hsl(270, 45%, 60%)' },
    ],
    createdAt: '2023-12-31',
    updatedAt: '2023-12-31',
    isReadOnly: true,
  },
  {
    id: 'soros',
    name: '索罗斯持仓参考',
    description: '基于Soros Fund Management公开持仓',
    assets: [
      { id: '1', name: '科技股', amount: 35, color: 'hsl(210, 45%, 60%)' },
      { id: '2', name: '金融股', amount: 25, color: 'hsl(150, 45%, 60%)' },
      { id: '3', name: '医疗保健', amount: 20, color: 'hsl(0, 45%, 60%)' },
      { id: '4', name: '消费品', amount: 12, color: 'hsl(30, 45%, 60%)' },
      { id: '5', name: '其他', amount: 8, color: 'hsl(270, 45%, 60%)' },
    ],
    createdAt: '2024-09-30',
    updatedAt: '2024-09-30',
    isReadOnly: true,
  },
];

// GET 请求：获取所有名人持仓或单个名人持仓
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // 如果提供了 id，返回单个名人持仓
    if (id) {
      const portfolio = CELEBRITY_HOLDINGS.find(p => p.id === id);
      
      if (!portfolio) {
        return NextResponse.json(
          { error: '未找到该名人持仓数据', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: portfolio,
      });
    }

    // 否则返回所有名人持仓列表
    return NextResponse.json({
      success: true,
      data: CELEBRITY_HOLDINGS,
      total: CELEBRITY_HOLDINGS.length,
    });
  } catch (error) {
    console.error('获取名人持仓数据失败:', error);
    return NextResponse.json(
      { error: '服务器错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
