"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import GlowCard from '@/components/ui/GlowCard';
import Button from '@/components/ui/Button';

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
    <div className="relative w-full min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Base64 编码解码
          </h2>
        </motion.div>

        {/* Tool Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlowCard className="p-8">
            {/* Mode Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 rounded-full p-1 flex gap-1">
                <Button
                  variant={mode === 'encode' ? 'primary' : 'ghost'}
                  size="md"
                  onClick={() => setMode('encode')}
                  className={mode === 'encode' ? '' : 'bg-transparent border-none hover:bg-white/10'}
                >
                  编码
                </Button>
                <Button
                  variant={mode === 'decode' ? 'primary' : 'ghost'}
                  size="md"
                  onClick={() => setMode('decode')}
                  className={mode === 'decode' ? '' : 'bg-transparent border-none hover:bg-white/10'}
                >
                  解码
                </Button>
              </div>
            </div>

            {/* Input Area */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">
                {mode === 'encode' ? '输入文本' : '输入Base64'}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? '请输入要编码的文本...' : '请输入要解码的Base64字符串...'}
                className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <Button
                variant="primary"
                size="md"
                onClick={handleProcess}
                className="flex-1"
              >
                {mode === 'encode' ? '编码' : '解码'}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleClear}
              >
                清空
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {/* Output Area */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-white font-medium">
                  {mode === 'encode' ? 'Base64结果' : '解码结果'}
                </label>
                {output && (
                  <Button
                    variant={copied ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={handleCopy}
                    className={copied ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                  >
                    {copied ? '✓ 已复制' : '复制结果'}
                  </Button>
                )}
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="结果将显示在这里..."
                className="w-full h-32 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 resize-none"
              />
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}