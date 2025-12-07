import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA'];
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Check if Redis is configured
const isRedisConfigured = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

// Redis keys and cache durations
const OVERVIEW_CACHE_KEY = 'finance:overview';
const QUOTE_CACHE_KEY = 'finance:quote';
const OVERVIEW_CACHE_SECONDS = 60 * 60 * 24; // 24 hours
const QUOTE_CACHE_SECONDS = 60 * 60 * 12; // 12 hours (Increased to avoid rate limits)

// Type definitions
type OverviewData = Record<string, { Symbol: string; Name: string; PERatio: string; ForwardPE: string; '52WeekHigh': string; '52WeekLow': string; }>;
type QuoteData = Record<string, { '01. symbol': string; '05. price': string; }>;

// Utility to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAndCache<T>(
  key: string,
  duration: number,
  fetcher: () => Promise<T>
): Promise<T> {
  if (isRedisConfigured) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        if (typeof cached === 'object') {
          return cached as T;
        }
        return JSON.parse(cached as string) as T;
      }
    } catch (e) {
      console.error(`Redis GET error for ${key}:`, e);
    }
  }

  const freshData = await fetcher();

  if (isRedisConfigured) {
    try {
      await redis.setex(key, duration, freshData);
    } catch (e) {
      console.error(`Redis SETEX error for ${key}:`, e);
    }
  }
  return freshData;
}

// Fetches overview data for all symbols
const fetchAllOverviews = async (): Promise<OverviewData> => {
  const overviewData: OverviewData = {};
  for (const symbol of SYMBOLS) {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.Note) throw new Error(`API limit reached for overview: ${data.Note}`);
    overviewData[symbol] = data;
    // 降低延迟时间，但仍需遵守 API 限制
    await delay(12000);
  }
  return overviewData;
};

// Fetches quote data for all symbols
const fetchAllQuotes = async (): Promise<QuoteData> => {
  const quoteData: QuoteData = {};
  for (const symbol of SYMBOLS) {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.Note) throw new Error(`API limit reached for quote: ${data.Note}`);
    quoteData[symbol] = data['Global Quote'];
    // 降低延迟时间，但仍需遵守 API 限制
    await delay(12000);
  }
  return quoteData;
};


const stockDetails = new Map<string, { name: string; color: string }>([
    ['AAPL', { name: 'Apple Inc.', color: '#A2AAAD' }],
    ['MSFT', { name: 'Microsoft Corp.', color: '#00A4EF' }],
    ['GOOGL', { name: 'Alphabet Inc.', color: '#4285F4' }],
    ['AMZN', { name: 'Amazon.com, Inc.', color: '#FF9900' }],
    ['NVDA', { name: 'NVIDIA Corp.', color: '#76B900' }],
    ['META', { name: 'Meta Platforms, Inc.', color: '#1877F2' }],
    ['TSLA', { name: 'Tesla, Inc.', color: '#E82127' }],
]);

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Alpha Vantage API key not configured.' }, { status: 500 });
  }

  try {
    const [overviewData, quoteData] = await Promise.all([
      fetchAndCache(OVERVIEW_CACHE_KEY, OVERVIEW_CACHE_SECONDS, fetchAllOverviews),
      fetchAndCache(QUOTE_CACHE_KEY, QUOTE_CACHE_SECONDS, fetchAllQuotes),
    ]);

    const combinedData = SYMBOLS.map(symbol => {
      const overview = overviewData ? overviewData[symbol] : null;
      const quote = quoteData ? quoteData[symbol] : null;
      const details = stockDetails.get(symbol);

      const price = quote?.['05. price'];

      return {
        symbol,
        name: details?.name || overview?.Name || 'N/A',
        price: price ? parseFloat(price).toFixed(2) : 'N/A',
        peRatio: overview?.PERatio || 'N/A',
        forwardPE: overview?.ForwardPE || 'N/A',
        fiftyTwoWeekHigh: overview?.['52WeekHigh'] || 'N/A',
        fiftyTwoWeekLow: overview?.['52WeekLow'] || 'N/A',
        color: details?.color || '#000000',
      };
    });

    return NextResponse.json(combinedData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Error fetching stock data:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
