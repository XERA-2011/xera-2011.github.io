"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, AlertTriangle } from 'lucide-react';

const generatePhoneNumber = () => {
  const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
};

const generateIdCard = () => {
  const areaCodes = ['110101', '110102', '110105', '110106', '110107'];
  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];

  const year = Math.floor(Math.random() * 30) + 1970;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  const birthDate = year.toString() + month.toString().padStart(2, '0') + day.toString().padStart(2, '0');

  const sequence = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  const first17 = areaCode + birthDate + sequence;

  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(first17[i]) * weights[i];
  }
  const checkCode = checkCodes[sum % 11];

  return first17 + checkCode;
};

const generateBankCard = () => {
  const binCodes = ['6225', '6227', '6228', '6229'];
  const binCode = binCodes[Math.floor(Math.random() * binCodes.length)];
  const randomDigits = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
  return binCode + randomDigits;
};

const generateCreditCode = () => {
  const regCodes = ['1', '5', '9', 'Y'];
  const regCode = regCodes[Math.floor(Math.random() * regCodes.length)];

  const orgCodes = ['1', '2', '3', '9'];
  const orgCode = orgCodes[Math.floor(Math.random() * orgCodes.length)];

  const areaCodes = ['110000', '120000', '130000', '140000'];
  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];

  const mainCode = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  const checkCode = Math.floor(Math.random() * 10).toString();

  return regCode + orgCode + areaCode + mainCode + checkCode;
};

interface GeneratedInfo {
  phone: string;
  idCard: string;
  bankCard: string;
  creditCode: string;
}

export default function InfoCreatePage() {
  usePageTitle('信息生成器');

  const [generatedInfo, setGeneratedInfo] = useState<GeneratedInfo | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  const generateAllInfo = () => {
    const info: GeneratedInfo = {
      phone: generatePhoneNumber(),
      idCard: generateIdCard(),
      bankCard: generateBankCard(),
      creditCode: generateCreditCode(),
    };
    setGeneratedInfo(info);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const copyAllInfo = async () => {
    if (!generatedInfo) return;

    const allInfo = `手机号: ${generatedInfo.phone}
身份证: ${generatedInfo.idCard}
银行卡: ${generatedInfo.bankCard}
统一信用代码: ${generatedInfo.creditCode}`;

    await copyToClipboard(allInfo, '全部信息');
  };

  return (
    <div className="relative w-full min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            信息生成器
          </h2>
        </motion.div>

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Button
            size="lg"
            onClick={generateAllInfo}
          >
            生成随机信息
          </Button>
        </motion.div>

        {generatedInfo && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <CardTitle>生成的信息</CardTitle>
                  <Button
                    size="sm"
                    onClick={copyAllInfo}
                    variant={copySuccess === '全部信息' ? 'default' : 'outline'}
                  >
                    {copySuccess === '全部信息' ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        复制全部
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-secondary rounded-lg gap-3">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">手机号码</Badge>
                    <div className="font-medium text-lg break-all">{generatedInfo.phone}</div>
                  </div>
                  <Button
                    size="sm"
                    variant={copySuccess === '手机号' ? 'default' : 'ghost'}
                    onClick={() => copyToClipboard(generatedInfo.phone, '手机号')}
                  >
                    {copySuccess === '手机号' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-secondary rounded-lg gap-3">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">身份证号</Badge>
                    <div className="font-medium text-lg break-all">{generatedInfo.idCard}</div>
                  </div>
                  <Button
                    size="sm"
                    variant={copySuccess === '身份证' ? 'default' : 'ghost'}
                    onClick={() => copyToClipboard(generatedInfo.idCard, '身份证')}
                  >
                    {copySuccess === '身份证' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-secondary rounded-lg gap-3">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">银行卡号</Badge>
                    <div className="font-medium text-lg break-all">{generatedInfo.bankCard}</div>
                  </div>
                  <Button
                    size="sm"
                    variant={copySuccess === '银行卡' ? 'default' : 'ghost'}
                    onClick={() => copyToClipboard(generatedInfo.bankCard, '银行卡')}
                  >
                    {copySuccess === '银行卡' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-secondary rounded-lg gap-3">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">统一信用代码</Badge>
                    <div className="font-medium text-lg break-all">{generatedInfo.creditCode}</div>
                  </div>
                  <Button
                    size="sm"
                    variant={copySuccess === '信用代码' ? 'default' : 'ghost'}
                    onClick={() => copyToClipboard(generatedInfo.creditCode, '信用代码')}
                  >
                    {copySuccess === '信用代码' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="mt-12 border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                重要提示
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground space-y-2 text-sm leading-relaxed">
                <li>• 本工具生成的所有信息均为随机虚拟数据，仅供测试使用</li>
                <li>• 请勿将生成的信息用于任何违法违规活动</li>
                <li>• 生成的身份证号码符合格式规范但并非真实有效证件</li>
                <li>• 银行卡号和统一信用代码同样为测试数据，不具备实际效力</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}