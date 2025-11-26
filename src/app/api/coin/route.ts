import { NextRequest, NextResponse } from 'next/server';

// CoinGecko API 端点
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';

// 缓存时间（秒）- 增加缓存时间
const CACHE_SECONDS = 60;

// 支持的币种映射
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
 * GET /api/coin
 * 查询加密货币价格
 *
 * 参数:
 * - coin: 币种符号（如 btc, eth, sol）可以是逗号分隔的多个币种
 * - vs: 目标货币（默认 usd）
 *
 * 示例:
 * - /api/coin?coin=btc
 * - /api/coin?coin=btc,eth,sol
 * - /api/coin?coin=btc&vs=usd
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const coinParam = searchParams.get('coin')?.toLowerCase() || 'btc';
    const vsCurrency = searchParams.get('vs')?.toLowerCase() || 'usd';

    // 解析币种参数（支持多个币种，逗号分隔）
    const coinSymbols = coinParam.split(',').map(c => c.trim());

    // 验证并转换币种符号为 CoinGecko ID
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
      return NextResponse.json(
        {
          error: 'Invalid coin symbol',
          message: `Supported coins: ${Object.keys(COIN_MAPPINGS).join(', ')}`,
          supported: COIN_MAPPINGS,
        },
        { status: 400 }
      );
    }

    // 构建 CoinGecko API 请求
    const params = new URLSearchParams({
      ids: coinIds.join(','),
      vs_currencies: vsCurrency,
      include_last_updated_at: 'true',
      include_24hr_change: 'true',
    });

    const apiUrl = `${COINGECKO_URL}?${params.toString()}`;

    // 请求 CoinGecko API
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    interface CoinPriceData {
      symbol: string;
      name: string;
      price: number;
      currency: string;
      lastUpdated: number;
      change24h: number | null;
    }

    // 转换数据格式，使用符号作为键
    const result: Record<string, CoinPriceData> = {};

    validSymbols.forEach((symbol, index) => {
      const coinId = coinIds[index];
      const coinData = data[coinId];

      if (coinData) {
        result[symbol] = {
          symbol: COIN_MAPPINGS[symbol].symbol,
          name: COIN_MAPPINGS[symbol].name,
          price: coinData[vsCurrency],
          currency: vsCurrency.toUpperCase(),
          lastUpdated: coinData.last_updated_at,
          change24h: coinData[`${vsCurrency}_24h_change`] || null,
        };
      }
    });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
      },
    });

  } catch (error) {
    console.error('Error fetching coin price:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch coin price',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
