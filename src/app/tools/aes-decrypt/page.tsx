"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import { useLocalStorage } from '@/hooks/use-local-storage';
import GlowCard from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, RotateCcw, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import CryptoJS from 'crypto-js';

// JSON 语法高亮
function syntaxHighlight(json: string): string {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\]]|,)/g,
    (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
          return `<span class="${cls}">${match.slice(0, -1)}</span><span class="json-colon">:</span>`;
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      } else if (/[{}\[\]]/.test(match)) {
        cls = 'json-brace';
      } else if (/,/.test(match)) {
        cls = 'json-comma';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export default function AesDecryptPage() {
  usePageTitle('AES 解密工具');
  const [ciphertext, setCiphertext] = useState('');
  const [keyStr, setKeyStr] = useLocalStorage('aes_tool_saved_key', '');
  const [output, setOutput] = useState('');
  const [outputHtml, setOutputHtml] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [mode, setMode] = useState<'decrypt' | 'encrypt'>('decrypt');

  // 计算密钥长度和有效性
  const keyInfo = useMemo(() => {
    const len = new TextEncoder().encode(keyStr).length;
    const bits = len * 8;
    const valid = [16, 24, 32].includes(len);
    return { len, bits, valid };
  }, [keyStr]);

  const handleDecrypt = () => {
    if (!ciphertext.trim()) {
      setError('请输入密文');
      return;
    }
    if (!keyStr.trim()) {
      setError('请输入密钥');
      return;
    }
    if (!keyInfo.valid) {
      setError(`密钥长度无效：当前 ${keyInfo.len} 字节（${keyInfo.bits} 位），需要 16/24/32 字节（128/192/256 位）`);
      return;
    }

    try {
      setError('');
      const key = CryptoJS.enc.Utf8.parse(keyStr);
      const decrypted = CryptoJS.AES.decrypt(ciphertext.trim(), key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

      if (!plaintext) {
        throw new Error('解密结果为空，请检查密文是否完整或密钥是否匹配');
      }

      setOutput(plaintext);

      // 尝试 JSON 格式化并语法高亮
      try {
        const jsonObj = JSON.parse(plaintext);
        const formatted = JSON.stringify(jsonObj, null, 2);
        setOutputHtml(syntaxHighlight(formatted));
      } catch {
        // 非 JSON，清除 HTML
        setOutputHtml('');
      }
    } catch (err) {
      setError('解密失败: ' + (err instanceof Error ? err.message : '未知错误'));
      setOutput('');
      setOutputHtml('');
    }
  };

  const handleEncrypt = () => {
    if (!ciphertext.trim()) {
      setError('请输入明文');
      return;
    }
    if (!keyStr.trim()) {
      setError('请输入密钥');
      return;
    }
    if (!keyInfo.valid) {
      setError(`密钥长度无效：当前 ${keyInfo.len} 字节（${keyInfo.bits} 位），需要 16/24/32 字节（128/192/256 位）`);
      return;
    }

    try {
      setError('');
      const key = CryptoJS.enc.Utf8.parse(keyStr);
      const encrypted = CryptoJS.AES.encrypt(ciphertext.trim(), key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      const result = encrypted.toString(); // Base64 输出
      setOutput(result);
      setOutputHtml('');
    } catch (err) {
      setError('加密失败: ' + (err instanceof Error ? err.message : '未知错误'));
      setOutput('');
      setOutputHtml('');
    }
  };

  const handleProcess = () => {
    if (mode === 'decrypt') {
      handleDecrypt();
    } else {
      handleEncrypt();
    }
  };

  const handleClear = () => {
    setCiphertext('');
    setOutput('');
    setOutputHtml('');
    setError('');
  };

  const handleCopy = async () => {
    if (output) {
      try {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            AES ECB 加解密工具
          </h1>
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
              <div className="bg-secondary rounded-full p-1 flex gap-1">
                <Button
                  variant={mode === 'decrypt' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('decrypt')}
                  className="gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  解密
                </Button>
                <Button
                  variant={mode === 'encrypt' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('encrypt')}
                  className="gap-2"
                >
                  <Lock className="w-4 h-4" />
                  加密
                </Button>
              </div>
            </div>

            {/* Key Input */}
            <div className="mb-6 space-y-2">
              <Label className="flex items-center gap-2">
                密钥 (Key)
                {keyStr && (
                  <Badge
                    variant={keyInfo.valid ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {keyInfo.bits} bit / {keyInfo.len} bytes
                  </Badge>
                )}
              </Label>
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={keyStr}
                  onChange={(e) => setKeyStr(e.target.value)}
                  placeholder="请输入 AES 密钥（16/24/32 字节对应 128/192/256 位）"
                  className="pr-10 font-mono"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Input Area */}
            <div className="mb-6 space-y-2">
              <Label>
                {mode === 'decrypt' ? '输入密文（Base64）' : '输入明文'}
              </Label>
              <Textarea
                value={ciphertext}
                onChange={(e) => setCiphertext(e.target.value)}
                placeholder={
                  mode === 'decrypt'
                    ? '请输入 Base64 编码的密文...'
                    : '请输入要加密的明文...'
                }
                className="h-32 resize-none font-mono"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <Button
                size="default"
                onClick={handleProcess}
                className="flex-1 gap-2"
                disabled={!ciphertext.trim() || !keyStr.trim()}
              >
                {mode === 'decrypt' ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    开始解密
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    开始加密
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={handleClear}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                清空
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                  {error}
                </div>
              </motion.div>
            )}

            {/* Output Area */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {mode === 'decrypt' ? '明文' : 'Base64'}
                  </Badge>
                  {mode === 'decrypt' ? '解密结果' : '加密结果'}
                </Label>
                {output && (
                  <Button
                    variant={copied ? 'default' : 'ghost'}
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制结果
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* JSON 语法高亮输出 或 纯文本 */}
              {outputHtml ? (
                <div
                  className="aes-result-box min-h-[8rem] rounded-md border border-border bg-[#1e1e2e] px-3 py-2 font-mono text-sm leading-relaxed text-[#cdd6f4] overflow-auto max-h-[500px] whitespace-pre-wrap break-all"
                  dangerouslySetInnerHTML={{ __html: outputHtml }}
                />
              ) : (
                <Textarea
                  value={output}
                  readOnly
                  placeholder="结果将显示在这里..."
                  className="h-32 resize-none bg-muted/30 font-mono"
                />
              )}
            </div>
          </GlowCard>
        </motion.div>
      </div>

      {/* JSON 语法高亮样式 */}
      <style jsx global>{`
        .aes-result-box .json-key { color: #89b4fa; }
        .aes-result-box .json-string { color: #a6e3a1; }
        .aes-result-box .json-number { color: #fab387; }
        .aes-result-box .json-boolean { color: #cba6f7; }
        .aes-result-box .json-null { color: #f38ba8; font-style: italic; }
        .aes-result-box .json-brace { color: #f9e2af; }
        .aes-result-box .json-colon { color: #9399b2; }
        .aes-result-box .json-comma { color: #9399b2; }
      `}</style>
    </div>
  );
}
