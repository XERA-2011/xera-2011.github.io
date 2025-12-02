"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check } from 'lucide-react';

export default function Base64Page() {
  usePageTitle('Base64 编码解码');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    try {
      setError('');
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
    } catch {
      setError('编码失败，请检查输入内容');
      setOutput('');
    }
  };

  const handleDecode = () => {
    try {
      setError('');
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
    } catch {
      setError('解码失败，请检查Base64格式是否正确');
      setOutput('');
    }
  };

  const handleProcess = () => {
    if (!input.trim()) {
      setError('请输入内容');
      return;
    }

    if (mode === 'encode') {
      handleEncode();
    } else {
      handleDecode();
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const handleCopy = async () => {
    if (output) {
      try {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // 2秒后重置状态
      } catch (err) {
        console.error('复制失败:', err);
        setError('复制失败，请手动复制');
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Base64 编码解码
          </h2>
        </motion.div>

        {/* Tool Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-8">
              {/* Mode Toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-secondary rounded-full p-1 flex gap-1">
                  <Button
                    variant={mode === 'encode' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('encode')}
                  >
                    编码
                  </Button>
                  <Button
                    variant={mode === 'decode' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('decode')}
                  >
                    解码
                  </Button>
                </div>
              </div>

              {/* Input Area */}
              <div className="mb-6 space-y-2">
                <Label>
                  {mode === 'encode' ? '输入文本' : '输入Base64'}
                </Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'encode' ? '请输入要编码的文本...' : '请输入要解码的Base64字符串...'}
                  className="h-32 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <Button
                  size="default"
                  onClick={handleProcess}
                  className="flex-1"
                >
                  {mode === 'encode' ? '编码' : '解码'}
                </Button>
                <Button
                  variant="secondary"
                  size="default"
                  onClick={handleClear}
                >
                  清空
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-destructive/20 border border-destructive/30 rounded-lg text-destructive">
                  {error}
                </div>
              )}

              {/* Output Area */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>
                    {mode === 'encode' ? 'Base64结果' : '解码结果'}
                  </Label>
                  {output && (
                    <Button
                      variant={copied ? 'default' : 'ghost'}
                      size="sm"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          复制结果
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <Textarea
                  value={output}
                  readOnly
                  placeholder="结果将显示在这里..."
                  className="h-32 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}