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
const QUOTE_CACHE_SECONDS = 60 * 60 * 12; // 12 hours

// Type definitions
type OverviewData = Record<string, { Symbol: string; Name: string; PERatio: string; ForwardPE: string; '52WeekHigh': string; '52WeekLow': string; }>;
type QuoteData = Record<string, { '01. symbol': string; '05. price': string; }>;

// In-memory cache fallback (Global variable to persist across invocations in same container)
const memoryCache = new Map<string, { data: any; expiry: number }>();

// Utility to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAndCache<T>(
  key: string,
  durationSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();

  // 1. Check In-Memory Cache first
  const memCached = memoryCache.get(key);
  if (memCached && memCached.expiry > now) {
    console.log(`[Cache] Limit hit memory cache for ${key}`);
    return memCached.data as T;
  }

  // 2. Check Redis
  if (isRedisConfigured) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        const parsed = (typeof cached === 'object') ? cached : JSON.parse(cached as string);
        // Populate memory cache from Redis hit
        memoryCache.set(key, { data: parsed, expiry: now + (durationSeconds * 1000) });
        console.log(`[Cache] Hit Redis for ${key}`);
        return parsed as T;
      }
    } catch (e) {
      console.error(`Redis GET error for ${key}:`, e);
    }
  }

  console.log(`[Cache] Miss for ${key}, fetching fresh data...`);
  const freshData = await fetcher();

  // 3. Save to Redis
  if (isRedisConfigured) {
    try {
      await redis.setex(key, durationSeconds, freshData);
    } catch (e) {
      console.error(`Redis SETEX error for ${key}:`, e);
    }
  }

  // 4. Save to Memory
  memoryCache.set(key, { data: freshData, expiry: now + (durationSeconds * 1000) });

  return freshData;
}

// Fetches overview data for all symbols
const fetchAllOverviews = async (): Promise<OverviewData> => {
  const overviewData: OverviewData = {};
  for (const [index, symbol] of SYMBOLS.entries()) {
    try {
      const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.Note) {
        console.warn(`API limit reached for overview ${symbol}: ${data.Note}`);
        // If we hit a limit, just stop trying to fetch more to save time, return what we have
        break; 
      }
      
      overviewData[symbol] = data;
      
      // Delay only if not the last item
      if (index < SYMBOLS.length - 1) {
        await delay(12000); 
      }
    } catch (err) {
      console.error(`Failed to fetch overview for ${symbol}`, err);
    }
  }
  return overviewData;
};

// Fetches quote data for all symbols
const fetchAllQuotes = async (): Promise<QuoteData> => {
  const quoteData: QuoteData = {};
  for (const [index, symbol] of SYMBOLS.entries()) {
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.Note) {
         console.warn(`API limit reached for quote ${symbol}: ${data.Note}`);
         break;
      }

      if (data['Global Quote']) {
        quoteData[symbol] = data['Global Quote'];
      }
      
      // Delay only if not the last item
      if (index < SYMBOLS.length - 1) {
        await delay(12000);
      }
    } catch (err) {
      console.error(`Failed to fetch quote for ${symbol}`, err);
    }
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
    // Return mock data for development if no key
    console.warn('No Alpha Vantage API Key. Returning mock data.');
     // Optionally we could return mock data here, but for now error is fine to prompt user config
    return NextResponse.json({ error: 'Alpha Vantage API key not configured.' }, { status: 500 });
  }

  try {
    // Parallelize the two main fetch groups
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

