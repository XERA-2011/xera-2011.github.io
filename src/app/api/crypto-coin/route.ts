import { NextRequest, NextResponse } from 'next/server';
import { renderCoinCard, renderMultiCoinCard, COIN_COLORS } from '@/utils/coin-render';

// CoinGecko API 端点
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';

// 缓存时间（秒）
const CACHE_SECONDS = 60;

// 内存缓存
interface CoinApiResponse {
  usd?: number;
  usd_24h_change?: number;
}

interface CacheEntry {
  data: Record<string, CoinApiResponse>;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = CACHE_SECONDS * 1000;

// 币种映射
const COIN_MAPPINGS: Record<string, { id: string; symbol: string; name: string }> = {
  btc: { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  eth: { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  etc: { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic' },
  bnb: { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  sol: { id: 'solana', symbol: 'SOL', name: 'Solana' },
  usdt: { id: 'tether', symbol: 'USDT', name: 'Tether' },
  xrp: { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  ada: { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  doge: { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  trx: { id: 'tron', symbol: 'TRX', name: 'TRON' },
};

/**
 * GET /api/crypto-coin
 * 生成币价 SVG 卡片
 *
 * 参数:
 * - coin: 币种符号（如 btc, eth, sol）可以是逗号分隔的多个币种
 * - mode: 渲染模式 single（单个大卡片）或 multi（多个小卡片网格）
 * - bgColor: 背景颜色（可选）
 * - hideBorder: 是否隐藏边框（可选）
 *
 * 示例:
 * - /api/crypto-coin?coin=btc
 * - /api/crypto-coin?coin=btc,eth,sol,bnb&mode=multi
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const coinParam = searchParams.get('coin')?.toLowerCase() || 'btc';
    const mode = searchParams.get('mode') || 'single';
    const bgColor = searchParams.get('bgColor') || '#0f172a';
    const hideBorder = searchParams.has('hideBorder');

    // 解析币种参数
    const coinSymbols = coinParam.split(',').map(c => c.trim());

    // 验证并转换币种符号
    const coinIds: string[] = [];
    const validSymbols: string[] = [];

    for (const symbol of coinSymbols) {
      const coinInfo = COIN_MAPPINGS[symbol];
      if (coinInfo) {
        coinIds.push(coinInfo.id);
        validSymbols.push(symbol);
      }
    }

    if (coinIds.length === 0) {
      return new NextResponse('Invalid coin symbol', { status: 400 });
    }

    // 创建缓存键
    const cacheKey = coinIds.sort().join('-');

    // 检查缓存
    const cachedEntry = cache.get(cacheKey);
    const now = Date.now();

    let data: Record<string, CoinApiResponse>;

    if (cachedEntry && (now - cachedEntry.timestamp) < CACHE_DURATION) {
      // 使用缓存数据
      console.log(`Using cached data for: ${cacheKey}`);
      data = cachedEntry.data;
    } else {
      // 构建 CoinGecko API 请求
      const params = new URLSearchParams({
        ids: coinIds.join(','),
        vs_currencies: 'usd',
        include_24hr_change: 'true',
      });

      const apiUrl = `${COINGECKO_URL}?${params.toString()}`;

      // 请求 CoinGecko API
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: CACHE_SECONDS },
      });

      if (!response.ok) {
        // 特殊处理 429 错误
        if (response.status === 429) {
          // 如果有缓存数据，即使过期也使用它
          if (cachedEntry) {
            console.log(`Rate limited, using stale cache for: ${cacheKey}`);
            data = cachedEntry.data;
          } else {
            throw new Error('API rate limit exceeded. Please try again later.');
          }
        } else {
          throw new Error(`CoinGecko API error: ${response.status}`);
        }
      } else {
        data = await response.json();

        // 更新缓存
        cache.set(cacheKey, {
          data,
          timestamp: now,
        });

        // 清理过期缓存
        for (const [key, entry] of cache.entries()) {
          if (now - entry.timestamp > CACHE_DURATION * 2) {
            cache.delete(key);
          }
        }
      }
    }

    // 生成 SVG
    let svgContent: string;

    if (mode === 'multi' && validSymbols.length > 1) {
      // 多币种网格模式
      const coinData = validSymbols.map(symbol => {
        const coinId = COIN_MAPPINGS[symbol].id;
        const coinInfo = data[coinId];

        return {
          symbol: COIN_MAPPINGS[symbol].symbol,
          name: COIN_MAPPINGS[symbol].name,
          price: coinInfo?.usd || 0,
          currency: 'USD',
          change24h: coinInfo?.usd_24h_change || null,
          color: COIN_COLORS[symbol] || '#ffffff',
        };
      });

      svgContent = renderMultiCoinCard(coinData);
    } else {
      // 单币种大卡片模式
      const symbol = validSymbols[0];
      const coinId = COIN_MAPPINGS[symbol].id;
      const coinInfo = data[coinId];

      svgContent = renderCoinCard({
        symbol: COIN_MAPPINGS[symbol].symbol,
        name: COIN_MAPPINGS[symbol].name,
        price: coinInfo?.usd || 0,
        currency: 'USD',
        change24h: coinInfo?.usd_24h_change || null,
        color: COIN_COLORS[symbol] || '#ffffff',
        bgColor,
        hideBorder,
      });
    }

    // 返回 SVG 响应
    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`,
      },
    });

  } catch (error) {
    console.error('Error generating coin card:', error);
    const message = error instanceof Error ? error.message : 'Error generating coin card';

    // 返回错误 SVG
    const errorSvg = `
<svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1e293b"/>
  <text x="200" y="120" font-family="Arial" font-size="14" fill="#ef4444" text-anchor="middle">${message}</text>
</svg>`;

    return new NextResponse(errorSvg, {
      status: error instanceof Error && error.message.includes('rate limit') ? 429 : 500,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
