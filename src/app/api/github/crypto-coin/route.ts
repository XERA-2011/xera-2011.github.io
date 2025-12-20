import { NextRequest, NextResponse } from 'next/server';
import { COIN_COLORS } from '@/lib/svg-renderers/coin-render';

// 主题配置
const THEME_CONFIG = {
  dark: { 
    bg: 'transparent', 
    border: '#27272a', // zinc-800
    text: '#fafafa',   // zinc-50
    title: '#fafafa',
    cardBg: '#18181b', // zinc-900
    positive: '#22c55e', // green-500
    negative: '#ef4444', // red-500
    neutral: '#71717a'   // zinc-500
  },
  light: { 
    bg: 'transparent', 
    border: '#e4e4e7', // zinc-200
    text: '#18181b',   // zinc-900
    title: '#18181b',
    cardBg: '#ffffff',
    positive: '#16a34a', // green-600
    negative: '#dc2626', // red-600
    neutral: '#a1a1aa'   // zinc-400
  },
};

type ThemeName = keyof typeof THEME_CONFIG;

/**
 * 渲染紧凑水平布局的多币种 SVG 卡片
 */
const renderHorizontalLayout = (
  coinData: Array<{
    symbol: string;
    price: number;
    change24h: number | null;
    color: string;
  }>,
  options: { 
    hideBorder?: boolean; 
    theme?: ThemeName;
    width?: number;
    height?: number;
  } = {}
) => {
  const { hideBorder = true, theme: themeName = 'dark', width: requestedWidth, height: requestedHeight } = options;
  const theme = THEME_CONFIG[themeName] || THEME_CONFIG.dark;

  // --- 布局参数 ---
  const itemCount = coinData.length;
  const cardWidth = 140;
  const cardHeight = 90;
  const gap = 12;
  const padding = 12;

  const contentWidth = itemCount * cardWidth + (itemCount - 1) * gap + padding * 2;
  const contentHeight = cardHeight + padding * 2;
  
  // 如果用户指定了宽高，则使用用户指定的；否则使用内容宽高
  const svgWidth = requestedWidth || contentWidth;
  const svgHeight = requestedHeight || contentHeight;
  
  const fontFamily = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const cards = coinData
    .map((coin, index) => {
      const x = padding + index * (cardWidth + gap);
      const y = padding;

      const priceText = `$${(coin.price || 0).toLocaleString('en-US', {
        minimumFractionDigits: coin.price > 10 ? 0 : 2,
        maximumFractionDigits: coin.price > 10 ? 0 : 2,
      })}`;

      const change = coin.change24h;
      let changeText = '-';
      let changeColor = theme.neutral;

      if (change != null) {
        changeText = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
        changeColor = change > 0 ? theme.positive : theme.negative;
      }

      return `
        <g transform="translate(${x}, ${y})">
          <rect width="${cardWidth}" height="${cardHeight}" fill="${theme.cardBg}" stroke="${theme.border}" stroke-width="1" rx="12" />

          <text x="${cardWidth / 2}" y="28" font-family="${fontFamily}" font-size="13" font-weight="600" fill="${coin.color || theme.text}" text-anchor="middle" letter-spacing="0.5">
            ${coin.symbol}
          </text>

          <text x="${cardWidth / 2}" y="56" font-family="${fontFamily}" font-size="18" font-weight="700" fill="${theme.text}" text-anchor="middle">
            ${priceText}
          </text>

          <text x="${cardWidth / 2}" y="76" font-family="${fontFamily}" font-size="12" font-weight="500" fill="${changeColor}" text-anchor="middle">
            ${changeText}
          </text>
        </g>
      `;
    })
    .join('');

  // 外层边框 (如果需要)
  const borderRect = hideBorder
    ? ''
    : `<rect x="0.5" y="0.5" width="${contentWidth - 1}" height="${contentHeight - 1}" fill="none" stroke="${theme.border}" rx="16" />`;

  return `
    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${contentWidth} ${contentHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${contentWidth}" height="${contentHeight}" fill="${theme.bg}" rx="16"/>
      ${cards}
      ${borderRect}
    </svg>
  `;
};


// --- API 和缓存逻辑 ---
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
const CACHE_SECONDS = 60;
interface CoinApiResponse { usd?: number; usd_24h_change?: number; }
interface CacheEntry { data: Record<string, CoinApiResponse>; timestamp: number; }
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = CACHE_SECONDS * 1000;
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    // 默认展示 btc,eth,sol
    const coinParam = searchParams.get('coin')?.toLowerCase() || 'btc,eth,sol';
    const theme = (searchParams.get('theme') || 'dark') as ThemeName;
    const requestedWidth = searchParams.get('width') ? parseInt(searchParams.get('width')!) : undefined;
    const requestedHeight = searchParams.get('height') ? parseInt(searchParams.get('height')!) : undefined;

    const coinSymbols = coinParam.split(',').map(c => c.trim()).filter(Boolean);
    const coinIds: string[] = [];
    const validSymbols: string[] = [];
    for (const symbol of coinSymbols) {
      const coinInfo = COIN_MAPPINGS[symbol];
      if (coinInfo) { coinIds.push(coinInfo.id); validSymbols.push(symbol); }
    }

    if (coinIds.length === 0) { return new NextResponse('Invalid coin symbol', { status: 400 }); }

    const cacheKey = `${coinIds.sort().join('-')}-${theme}`;
    const cachedEntry = cache.get(cacheKey);
    const now = Date.now();
    let data: Record<string, CoinApiResponse>;

    if (cachedEntry && (now - cachedEntry.timestamp) < CACHE_DURATION) {
      data = cachedEntry.data;
    } else {
      const params = new URLSearchParams({ ids: coinIds.join(','), vs_currencies: 'usd', include_24hr_change: 'true' });
      const apiUrl = `${COINGECKO_URL}?${params.toString()}`;
      const response = await fetch(apiUrl, { headers: { 'Accept': 'application/json' }, next: { revalidate: CACHE_SECONDS } });
      if (!response.ok) {
        if (response.status === 429 && cachedEntry) { data = cachedEntry.data; }
        else { throw new Error(`API error: ${response.status}`); }
      } else {
        data = await response.json();
        cache.set(cacheKey, { data, timestamp: now });
      }
    }

    const coinData = validSymbols.map(symbol => ({
      symbol: COIN_MAPPINGS[symbol].symbol,
      price: data[COIN_MAPPINGS[symbol].id]?.usd || 0,
      change24h: data[COIN_MAPPINGS[symbol].id]?.usd_24h_change || null,
      color: COIN_COLORS[symbol] || '#ffffff',
    }));

    const svgContent = renderHorizontalLayout(coinData, {
      hideBorder: !searchParams.has('showBorder'),
      theme,
      width: requestedWidth,
      height: requestedHeight,
    });

    return new NextResponse(svgContent, {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}` },
    });
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const themeConfig = THEME_CONFIG.dark;
    const errorSvg = `<svg width="400" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${themeConfig.bg}"/><text x="50%" y="50%" font-family="sans-serif" fill="${themeConfig.text}" text-anchor="middle">${message}</text></svg>`;
    return new NextResponse(errorSvg, { status: 500, headers: { 'Content-Type': 'image/svg+xml' } });
  }
}
