/**
 * SVG 币价卡片渲染工具函数
 */

interface CoinCardOptions {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change24h: number | null;
  color: string;
  bgColor?: string;
  hideBorder?: boolean;
}

// 币种颜色映射
export const COIN_COLORS: Record<string, string> = {
  btc: '#F7931A',    // Bitcoin Orange
  eth: '#627EEA',    // Ethereum Blue
  sol: '#14F195',    // Solana Green
  bnb: '#F3BA2F',    // Binance Yellow
  etc: '#328332',    // Ethereum Classic Green
  usdt: '#26A17B',   // Tether Green
  xrp: '#23292F',    // XRP Dark
  ada: '#0033AD',    // Cardano Blue
  doge: '#C2A633',   // Dogecoin Gold
  trx: '#EF0027',    // Tron Red
};

/**
 * 格式化价格
 */
function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }
  return price.toLocaleString('en-US', { maximumSignificantDigits: 6 });
}

/**
 * 格式化变化百分比
 */
function formatChange(change: number | null): string {
  if (change === null) return 'N/A';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * 渲染币价卡片
 */
export function renderCoinCard(options: CoinCardOptions): string {
  const {
    symbol,
    name,
    price,
    currency,
    change24h,
    color,
    bgColor = '#0f172a',
    hideBorder = false,
  } = options;

  const border = hideBorder ? '2px solid transparent' : `2px solid ${color}40`;
  const changeColor = change24h !== null && change24h >= 0 ? '#10b981' : '#ef4444';
  const changeText = formatChange(change24h);
  const priceText = formatPrice(price);

  return `
<svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color}15;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%;">
      <style>
        .coin-card-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${bgColor.replace('#', '%23')};stop-opacity:1"/><stop offset="100%" style="stop-color:${color.replace('#', '%23')}15;stop-opacity:1"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/></svg>');
          border: ${border};
          border-radius: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
          box-sizing: border-box;
        }
        .coin-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .coin-symbol {
          font-size: 32px;
          font-weight: 700;
          color: ${color};
          text-shadow: 0 0 20px ${color}60;
          letter-spacing: -0.5px;
        }
        .coin-name {
          font-size: 14px;
          color: #94a3b8;
          font-weight: 500;
        }
        .coin-price-section {
          margin: 20px 0;
        }
        .coin-price {
          font-size: 48px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1;
          margin-bottom: 8px;
          letter-spacing: -1px;
        }
        .coin-currency {
          font-size: 14px;
          color: #64748b;
          text-transform: uppercase;
        }
        .coin-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid ${color}20;
        }
        .coin-change {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: ${changeColor}20;
          border-radius: 20px;
          font-size: 16px;
          font-weight: 600;
          color: ${changeColor};
        }
        .coin-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      </style>
      <div class="coin-card-container">
        <div class="coin-header">
          <div class="coin-symbol">${symbol}</div>
          <div class="coin-name">${name}</div>
        </div>
        <div class="coin-price-section">
          <div class="coin-price">$${priceText}</div>
          <div class="coin-currency">${currency}</div>
        </div>
        <div class="coin-footer">
          <div class="coin-label">24h Change</div>
          <div class="coin-change">
            ${change24h !== null && change24h >= 0 ? '↗' : '↘'} ${changeText}
          </div>
        </div>
      </div>
    </div>
  </foreignObject>
</svg>`;
}

/**
 * 渲染多币种网格卡片
 */
export function renderMultiCoinCard(coins: CoinCardOptions[]): string {
  const cols = 2;
  const rows = Math.ceil(coins.length / cols);
  const cardWidth = 200;
  const cardHeight = 140;
  const gap = 16;
  const padding = 20;

  const totalWidth = cols * cardWidth + (cols - 1) * gap + padding * 2;
  const totalHeight = rows * cardHeight + (rows - 1) * gap + padding * 2;

  const coinCards = coins.map((coin, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = padding + col * (cardWidth + gap);
    const y = padding + row * (cardHeight + gap);

    const changeColor = coin.change24h !== null && coin.change24h >= 0 ? '#10b981' : '#ef4444';
    const changeText = formatChange(coin.change24h);
    const priceText = formatPrice(coin.price);

    return `
      <g transform="translate(${x}, ${y})">
        <rect width="${cardWidth}" height="${cardHeight}" rx="12" fill="transparent" stroke="${coin.color}40" stroke-width="2"/>
        <text x="${cardWidth / 2}" y="35" font-size="24" font-weight="700" fill="${coin.color}" text-anchor="middle" font-family="Arial, sans-serif">${coin.symbol}</text>
        <text x="${cardWidth / 2}" y="55" font-size="10" fill="#94a3b8" text-anchor="middle" font-family="Arial, sans-serif">${coin.name}</text>
        <text x="${cardWidth / 2}" y="85" font-size="20" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="Arial, sans-serif">$${priceText}</text>
        <rect x="${cardWidth / 2 - 40}" y="100" width="80" height="24" rx="12" fill="${changeColor}20"/>
        <text x="${cardWidth / 2}" y="116" font-size="12" font-weight="600" fill="${changeColor}" text-anchor="middle" font-family="Arial, sans-serif">${changeText}</text>
      </g>
    `;
  }).join('');

  return `
<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="transparent"/>
  ${coinCards}
</svg>`;
}
