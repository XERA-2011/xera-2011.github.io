import { NextRequest, NextResponse } from 'next/server';

// 假设 renderCoinCard 和 COIN_COLORS 存在于你的工具文件中
import { renderCoinCard, COIN_COLORS } from '@/components/github/coin-render';

// 主题配置
const THEME_CONFIG = {
  dark: { 
    bg: '#0d1117', 
    border: '#30363d', 
    text: '#c9d1d9', 
    title: '#c9d1d9',
    cardBg: '#1e293b',
    positive: '#10b981',
    negative: '#f43f5e',
    neutral: '#94a3b8'
  },
  light: { 
    bg: '#ffffff', 
    border: '#e1e4e8', 
    text: '#24292e', 
    title: '#24292e',
    cardBg: '#f8fafc',
    positive: '#10b981',
    negative: '#f43f5e',
    neutral: '#64748b'
  },
};

type ThemeName = keyof typeof THEME_CONFIG;

/**
 * 渲染一个智能的、方形网格的多币种 SVG 卡片 (默认无边框)
 * @param coinData - 包含多种币种信息的数组
 * @param options - 包含边框设置和主题的选项
 */
const renderSquareGridCard = (
  coinData: Array<{
    symbol: string;
    price: number;
    change24h: number | null;
    color: string;
  }>,
  options: { hideBorder?: boolean; theme?: ThemeName } = {}
) => {
  // --- 主要改动: 默认隐藏边框 ---
  const { hideBorder = true, theme: themeName = 'dark' } = options;
  const theme = THEME_CONFIG[themeName] || THEME_CONFIG.dark;

  // --- 布局参数 ---
  const itemCount = coinData.length;
  const cols = Math.ceil(Math.sqrt(itemCount));
  const rows = Math.ceil(itemCount / cols);

  const cell_size = 120; // 每个单元格的尺寸
  const gap = 15;       // 单元格之间的间距
  const padding = 15;   // 整体内边距

  const svgWidth = cols * cell_size + (cols - 1) * gap + padding * 2;
  const svgHeight = rows * cell_size + (rows - 1) * gap + padding * 2;
  const fontFamily = "'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif";

  const cards = coinData
    .map((coin, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      const x = padding + col * (cell_size + gap);
      const y = padding + row * (cell_size + gap);

      const priceText = `$ ${(coin.price || 0).toLocaleString('en-US', {
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
          <rect width="${cell_size}" height="${cell_size}" fill="${theme.cardBg}" rx="10" />

          <text x="${cell_size / 2}" y="32" font-family="${fontFamily}" font-size="18" font-weight="bold" fill="${coin.color || theme.text}" text-anchor="middle">
            ${coin.symbol}
          </text>

          <text x="${cell_size / 2}" y="70" font-family="${fontFamily}" font-size="20" font-weight="bold" fill="${theme.text}" text-anchor="middle">
            ${priceText}
          </text>

          <text x="${cell_size / 2}" y="98" font-family="${fontFamily}" font-size="14" font-weight="bold" fill="${changeColor}" text-anchor="middle">
            ${changeText}
          </text>
        </g>
      `;
    })
    .join('');

  const borderRect = hideBorder
    ? ''
    : `<rect x="0.5" y="0.5" width="${svgWidth - 1}" height="${svgHeight - 1}" fill="none" stroke="${theme.border}" rx="12" />`;

  return `
    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${svgWidth}" height="${svgHeight}" fill="${theme.bg}" rx="12"/>
      ${cards}
      ${borderRect}
    </svg>
  `;
};

/**
 * 渲染紧凑水平布局的多币种 SVG 卡片
 * @param coinData - 包含多种币种信息的数组
 * @param options - 包含边框设置和主题的选项
 */
const renderHorizontalLayout = (
  coinData: Array<{
    symbol: string;
    price: number;
    change24h: number | null;
    color: string;
  }>,
  options: { hideBorder?: boolean; theme?: ThemeName } = {}
) => {
  const { hideBorder = true, theme: themeName = 'dark' } = options;
  const theme = THEME_CONFIG[themeName] || THEME_CONFIG.dark;

  // --- 布局参数 ---
  const itemCount = coinData.length;
  const cardWidth = 150;
  const cardHeight = 100;
  const gap = 10;
  const padding = 15;

  const svgWidth = itemCount * cardWidth + (itemCount - 1) * gap + padding * 2;
  const svgHeight = cardHeight + padding * 2;
  const fontFamily = "'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif";

  const cards = coinData
    .map((coin, index) => {
      const x = padding + index * (cardWidth + gap);
      const y = padding;

      const priceText = `$ ${(coin.price || 0).toLocaleString('en-US', {
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
          <rect width="${cardWidth}" height="${cardHeight}" fill="${theme.cardBg}" rx="8" />

          <text x="${cardWidth / 2}" y="25" font-family="${fontFamily}" font-size="16" font-weight="bold" fill="${coin.color || theme.text}" text-anchor="middle">
            ${coin.symbol}
          </text>

          <text x="${cardWidth / 2}" y="50" font-family="${fontFamily}" font-size="18" font-weight="bold" fill="${theme.text}" text-anchor="middle">
            ${priceText}
          </text>

          <text x="${cardWidth / 2}" y="75" font-family="${fontFamily}" font-size="12" font-weight="bold" fill="${changeColor}" text-anchor="middle">
            ${changeText}
          </text>
        </g>
      `;
    })
    .join('');

  const borderRect = hideBorder
    ? ''
    : `<rect x="0.5" y="0.5" width="${svgWidth - 1}" height="${svgHeight - 1}" fill="none" stroke="${theme.border}" rx="12" />`;

  return `
    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${svgWidth}" height="${svgHeight}" fill="${theme.bg}" rx="12"/>
      ${cards}
      ${borderRect}
    </svg>
  `;
};


// --- API 和缓存逻辑 (保持不变) ---
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
const CACHE_SECONDS = 60;
interface CoinApiResponse { usd?: number; usd_24h_change?: number; }
interface CacheEntry { data: Record<string, CoinApiResponse>; timestamp: number; }
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = CACHE_SECONDS * 1000;
const COIN_MAPPINGS: Record<string, { id: string; symbol: string; name: string }> = {
    btc: { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' }, eth: { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' }, etc: { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic' }, bnb: { id: 'binancecoin', symbol: 'BNB', name: 'BNB' }, sol: { id: 'solana', symbol: 'SOL', name: 'Solana' }, usdt: { id: 'tether', symbol: 'USDT', name: 'Tether' }, xrp: { id: 'ripple', symbol: 'XRP', name: 'XRP' }, ada: { id: 'cardano', symbol: 'ADA', name: 'Cardano' }, doge: { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' }, trx: { id: 'tron', symbol: 'TRX', name: 'TRON' },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const coinParam = searchParams.get('coin')?.toLowerCase() || 'btc';
    const mode = searchParams.get('mode') || 'single';
    const layout = searchParams.get('layout') || 'grid';
    const theme = (searchParams.get('theme') || 'dark') as ThemeName;

    const coinSymbols = coinParam.split(',').map(c => c.trim()).filter(Boolean);
    const coinIds: string[] = [];
    const validSymbols: string[] = [];
    for (const symbol of coinSymbols) {
      const coinInfo = COIN_MAPPINGS[symbol];
      if (coinInfo) { coinIds.push(coinInfo.id); validSymbols.push(symbol); }
    }

    if (coinIds.length === 0) { return new NextResponse('Invalid coin symbol', { status: 400 }); }

    const cacheKey = `${coinIds.sort().join('-')}-${layout}-${theme}`;
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

    let svgContent: string;

    if (mode === 'multi' && validSymbols.length > 1) {
      const coinData = validSymbols.map(symbol => ({
        symbol: COIN_MAPPINGS[symbol].symbol,
        price: data[COIN_MAPPINGS[symbol].id]?.usd || 0,
        change24h: data[COIN_MAPPINGS[symbol].id]?.usd_24h_change || null,
        color: COIN_COLORS[symbol] || '#ffffff',
      }));

      // 根据布局类型选择渲染函数
      if (layout === 'horizontal') {
        svgContent = renderHorizontalLayout(coinData, {
          hideBorder: !searchParams.has('showBorder'),
          theme,
        });
      } else {
        // 默认网格布局
        svgContent = renderSquareGridCard(coinData, {
          hideBorder: !searchParams.has('showBorder'),
          theme,
        });
      }
    } else {
      const symbol = validSymbols[0];
      svgContent = renderCoinCard({
        symbol: COIN_MAPPINGS[symbol].symbol,
        name: COIN_MAPPINGS[symbol].name,
        price: data[COIN_MAPPINGS[symbol].id]?.usd || 0,
        currency: 'USD',
        change24h: data[COIN_MAPPINGS[symbol].id]?.usd_24h_change || null,
        color: COIN_COLORS[symbol] || '#ffffff',
        hideBorder: !searchParams.has('showBorder'),
      });
    }

    return new NextResponse(svgContent, {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}` },
    });
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    // 使用主题配置来渲染错误卡片
    const themeConfig = THEME_CONFIG.dark; // 默认使用深色主题
    const errorSvg = `<svg width="400" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${themeConfig.bg}"/><text x="50%" y="50%" font-family="sans-serif" fill="${themeConfig.text}" text-anchor="middle">${message}</text></svg>`;
    return new NextResponse(errorSvg, { status: 500, headers: { 'Content-Type': 'image/svg+xml' } });
  }
}
