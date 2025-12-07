'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calculator, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface LoanPayment {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export default function LoanCalculatorPage() {
  usePageTitle('贷款计算器');

  const [loanAmount, setLoanAmount] = useState<string>('1000000'); // 100万
  const [interestRate, setInterestRate] = useState<string>('4.9'); // 4.9%
  const [loanTerm, setLoanTerm] = useState<string>('30'); // 30年
  const [paymentType, setPaymentType] = useState<'equal' | 'declining'>('equal'); // 等额本息 or 等额本金

  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [paymentSchedule, setPaymentSchedule] = useState<LoanPayment[]>([]);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('');
  const itemsPerPage = 10;

  useEffect(() => {
    calculateLoan();
  }, [loanAmount, interestRate, loanTerm, paymentType]);

  const calculateLoan = () => {
    try {
      const principal = parseFloat(loanAmount);
      const annualRate = parseFloat(interestRate);
      const years = parseInt(loanTerm);

      if (isNaN(principal) || isNaN(annualRate) || isNaN(years) || principal <= 0 || annualRate < 0 || years <= 0) {
        setError('请输入有效的数值');
        return;
      }

      setError('');

      const monthlyRate = annualRate / 100 / 12;
      const totalMonths = years * 12;

      let monthlyPayment = 0;
      let totalPayment = 0;
      let totalInterest = 0;
      const schedule: LoanPayment[] = [];

      if (paymentType === 'equal') {
        // 等额本息计算
        monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1);
        totalPayment = monthlyPayment * totalMonths;
        totalInterest = totalPayment - principal;

        // 生成还款计划
        let remainingBalance = principal;
        for (let month = 1; month <= totalMonths; month++) {
          const interestPayment = remainingBalance * monthlyRate;
          const principalPayment = monthlyPayment - interestPayment;
          remainingBalance -= principalPayment;

          schedule.push({
            month,
            payment: monthlyPayment,
            principal: principalPayment,
            interest: interestPayment,
            remainingBalance: Math.max(0, remainingBalance)
          });
        }
      } else {
        // 等额本金计算
        const monthlyPrincipal = principal / totalMonths;
        let remainingBalance = principal;

        for (let month = 1; month <= totalMonths; month++) {
          const monthlyInterest = remainingBalance * monthlyRate;
          const monthlyPayment = monthlyPrincipal + monthlyInterest;

          schedule.push({
            month,
            payment: monthlyPayment,
            principal: monthlyPrincipal,
            interest: monthlyInterest,
            remainingBalance
          });

          remainingBalance -= monthlyPrincipal;
          totalPayment += monthlyPayment;
          totalInterest += monthlyInterest;
        }

        // 设置第一个月的还款额（最高）
        monthlyPayment = schedule[0].payment;
      }

      setMonthlyPayment(monthlyPayment);
      setTotalPayment(totalPayment);
      setTotalInterest(totalInterest);
      setPaymentSchedule(schedule);
      setCurrentPage(1); // Reset to first page when calculation changes
    } catch (err) {
      setError('计算出错，请检查输入参数');
      console.error(err);
    }
  };

  const resetForm = () => {
    setLoanAmount('1000000');
    setInterestRate('4.9');
    setLoanTerm('30');
    setPaymentType('equal');
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            贷款计算器
          </h2>
        </motion.div>

        {/* Tool Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Loan Calculator All-in-One Panel */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-8">
                {/* Loan Parameters */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">贷款参数</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 还款方式选择 */}
                    <div className="md:col-span-3 space-y-2">
                      <Label className="text-sm">还款方式</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={paymentType === 'equal' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPaymentType('equal')}
                          className="flex-1 text-xs py-1"
                        >
                          等额本息
                        </Button>
                        <Button
                          variant={paymentType === 'declining' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPaymentType('declining')}
                          className="flex-1 text-xs py-1"
                        >
                          等额本金
                        </Button>
                      </div>
                    </div>

                    {/* 贷款总额 */}
                    <div className="space-y-1">
                      <Label htmlFor="loanAmount" className="text-xs">贷款总额 (元)</Label>
                      <Input
                        id="loanAmount"
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        placeholder="金额"
                        className="text-sm py-1"
                      />
                    </div>

                    {/* 年利率 */}
                    <div className="space-y-1">
                      <Label htmlFor="interestRate" className="text-xs">年利率 (%)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.01"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        placeholder="利率"
                        className="text-sm py-1"
                      />
                    </div>

                    {/* 贷款期限 */}
                    <div className="space-y-1">
                      <Label htmlFor="loanTerm" className="text-xs">贷款期限 (年)</Label>
                      <Input
                        id="loanTerm"
                        type="number"
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(e.target.value)}
                        placeholder="期限"
                        className="text-sm py-1"
                      />
                    </div>
                  </div>

                  {/* 重置按钮 */}
                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={resetForm}
                      className="w-full"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      重置
                    </Button>
                  </div>
                </div>

                {/* Loan Results */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-6">贷款结果</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">每月月供</div>
                      <div className="text-xl font-bold mt-1">
                        {formatCurrency(monthlyPayment)}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">总还款额</div>
                      <div className="text-xl font-bold mt-1">
                        {formatCurrency(totalPayment)}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">总利息</div>
                      <div className="text-xl font-bold mt-1">
                        {formatCurrency(totalInterest)}
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 p-4 bg-destructive/20 border border-destructive/30 rounded-lg text-destructive text-sm">
                      {error}
                    </div>
                  )}
                </div>

                {/* Payment Schedule */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">还款计划</h3>
                  <div className="overflow-x-auto">
                    <Table className="text-sm">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs py-2">期数</TableHead>
                          <TableHead className="text-xs py-2">月供</TableHead>
                          <TableHead className="text-xs py-2">本金</TableHead>
                          <TableHead className="text-xs py-2">利息</TableHead>
                          <TableHead className="text-xs py-2">剩余本金</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentSchedule
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((payment) => (
                            <TableRow key={payment.month} className="h-10">
                              <TableCell className="py-2 px-3 text-xs font-medium">{payment.month}</TableCell>
                              <TableCell className="py-2 px-3 text-xs">{formatCurrency(payment.payment)}</TableCell>
                              <TableCell className="py-2 px-3 text-xs">{formatCurrency(payment.principal)}</TableCell>
                              <TableCell className="py-2 px-3 text-xs">{formatCurrency(payment.interest)}</TableCell>
                              <TableCell className="py-2 px-3 text-xs">{formatCurrency(payment.remainingBalance)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  {paymentSchedule.length > itemsPerPage && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="text-xs py-1"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        上一页
                      </Button>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">第 {currentPage} 页，共 {Math.ceil(paymentSchedule.length / itemsPerPage)} 页 </span>
                        <Input
                          type="number"
                          min="1"
                          max={Math.ceil(paymentSchedule.length / itemsPerPage)}
                          value={pageInput}
                          onChange={(e) => setPageInput(e.target.value)}
                          placeholder="页数"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const page = parseInt(e.currentTarget.value);
                              if (page >= 1 && page <= Math.ceil(paymentSchedule.length / itemsPerPage)) {
                                setCurrentPage(page);
                                setPageInput('');
                              }
                            }
                          }}
                          className="w-24 h-8 text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const page = parseInt(pageInput);
                            if (page >= 1 && page <= Math.ceil(paymentSchedule.length / itemsPerPage)) {
                              setCurrentPage(page);
                              setPageInput('');
                            }
                          }}
                          className="text-xs py-1"
                        >
                          前往
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(paymentSchedule.length / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(paymentSchedule.length / itemsPerPage)}
                        className="text-xs py-1"
                      >
                        下一页
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}

                  {paymentSchedule.length > 0 && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      <p>
                        <Badge variant="secondary" className="mr-2 text-xs">说明</Badge>
                        {paymentType === 'equal'
                          ? '等额本息：每月还款额固定，前期利息占比高，后期本金占比高'
                          : '等额本金：每月还款本金固定，月供逐月递减'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}