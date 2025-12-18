'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  AlertCircle,
  Info,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/use-page-title';
import ScrollReveal from '@/components/scroll-reveal';


// Define the structure of our stock data
interface StockData {
  symbol: string;
  name: string;
  price: string;
  peRatio: string;
  forwardPE: string;
  fiftyTwoWeekHigh: string;
  fiftyTwoWeekLow: string;
  color: string;
}

// A skeleton table row to show while loading
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell className="font-medium">
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
    </TableCell>
  </TableRow>
);

export default function FinancePage() {
  usePageTitle('金融看板');
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/finance/alphavantage');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }
        const data = await response.json();
        setStocks(data);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, []);

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            七巨头看板
          </h1>

        </motion.div>

        <ScrollReveal delay={0.3}>
          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg relative flex items-center gap-3 max-w-4xl mx-auto mb-8">
              <Info className="h-5 w-5 shrink-0" />
              <div className="text-sm">
                <strong className="font-bold block sm:inline">正在获取最新市场数据。</strong>
                <span className="block sm:inline ml-1">由于 API 限制，初次加载可能需要 1-2 分钟，请耐心等待。后续加载将瞬间完成。</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center gap-3 max-w-4xl mx-auto mb-8">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <strong className="font-bold">数据获取失败:</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            </div>
          )}

          <Card className="overflow-hidden max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle>股票概览</CardTitle>
              <CardDescription>
                美股七大科技巨头公司的市场数据。
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-25">代码</TableHead>
                      <TableHead>公司</TableHead>
                      <TableHead>当前股价</TableHead>
                      <TableHead>市盈率(TTM)</TableHead>
                      <TableHead>远期市盈率</TableHead>
                      <TableHead>52周最高</TableHead>
                      <TableHead>52周最低</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 7 }).map((_, i) => (
                        <TableRowSkeleton key={i} />
                      ))
                    ) : stocks.length > 0 ? (
                      stocks.map(stock => (
                        <TableRow key={stock.symbol}>
                          <TableCell className="font-medium" style={{ color: stock.color }}>
                            {stock.symbol}
                          </TableCell>
                          <TableCell>{stock.name}</TableCell>
                          <TableCell>${stock.price}</TableCell>
                          <TableCell>{stock.peRatio}</TableCell>
                          <TableCell>{stock.forwardPE}</TableCell>
                          <TableCell>${stock.fiftyTwoWeekHigh}</TableCell>
                          <TableCell>${stock.fiftyTwoWeekLow}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          没有可用的股票数据。
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>数据由 Alpha Vantage 提供。保留所有权利。</p>
        </div>

      </div>
    </div>
  );
}
