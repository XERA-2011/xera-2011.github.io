'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import GlowCard from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, Key, Bot, AlertCircle, CheckCircle } from 'lucide-react';

export default function Home() {
  usePageTitle('Gemini API');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<Array<{ name: string }>>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('你是谁?');
  const [result, setResult] = useState('等待调用...');
  const [displayedResult, setDisplayedResult] = useState('等待调用...');
  const [modelStatus, setModelStatus] = useState('');
  const [modelError, setModelError] = useState('');
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch models function extracted to avoid direct state setting in useEffect
  const fetchModels = useCallback(async (key: string) => {
    setLoadingModels(true);
    setModelStatus('正在加载模型列表...');
    setModelError('');
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
      );
      if (!res.ok) {
        const text = await res.text();
        setModelError(`HTTP ${res.status}: ${text}`);
        setModelStatus('模型列表加载失败');
        setLoadingModels(false);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data.models)) {
        setModels(data.models);
        setSelectedModel(data.models[0]?.name || '');
        setModelStatus('模型列表加载成功');
      } else {
        setModelStatus('未获取到模型列表');
      }
    } catch (err) {
      setModelError(err instanceof Error ? err.message : String(err));
      setModelStatus('模型列表加载异常');
    } finally {
      setLoadingModels(false);
    }
  }, []);

  // 初始化时从localStorage读取apiKey（带30天有效期）
  useLayoutEffect(() => {
    const stored = localStorage.getItem('gemini_api_key_obj');
    if (stored) {
      try {
        const obj = JSON.parse(stored);
        if (obj.value && obj.timestamp) {
          const now = Date.now();
          const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
          if (now - obj.timestamp < THIRTY_DAYS) {
            setApiKey(obj.value);
          } else {
            localStorage.removeItem('gemini_api_key_obj');
          }
        }
      } catch { }
    }
  }, []);

  // 打字机效果：逐字显示 result
  useEffect(() => {
    if (typeof result !== 'string') {
      return;
    }
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    let i = 0;
    // 先清空再开始打字机效果，避免直接setState
    const timeoutId = setTimeout(() => {
      setDisplayedResult('');
      typingIntervalRef.current = setInterval(() => {
        setDisplayedResult(() => {
          if (i >= result.length) {
            if (typingIntervalRef.current) {
              clearInterval(typingIntervalRef.current);
            }
            return result;
          }
          const next = result.slice(0, i + 1);
          i++;
          return next;
        });
      }, 18);
    }, 0);

    // 清理定时器和timeout
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      clearTimeout(timeoutId);
    };
  }, [result]);

  const handleGenerate = async () => {
    if (!apiKey || !prompt || !selectedModel) {
      setResult('请填写 API Key，选择模型并输入 Prompt');
      return;
    }
    setResult('请求中，请稍候……');

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${selectedModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: prompt }] },
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 256 },
          }),
        },
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const json = await res.json();
      // 只显示AI返回的内容
      let aiText = '';
      if (json.candidates && Array.isArray(json.candidates) && json.candidates[0]?.content?.parts?.[0]?.text) {
        aiText = json.candidates[0].content.parts[0].text;
      } else if (json.candidates && Array.isArray(json.candidates) && json.candidates[0]?.content?.parts?.[0]) {
        aiText = json.candidates[0].content.parts[0];
      } else {
        aiText = JSON.stringify(json, null, 2);
      }
      setResult(aiText);
    } catch (err) {
      if (err instanceof Error) {
        setResult(`调用失败：\n${err.message}`);
      } else {
        setResult('调用失败：未知错误');
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
            Gemini API 调用
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlowCard className="p-8">
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerate();
              }}
            >
              {/* API Key Section */}
              <div className="space-y-3">
                <Label htmlFor="api-key-input" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="api-key-input"
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      const val = e.target.value;
                      setApiKey(val);
                      localStorage.setItem('gemini_api_key_obj', JSON.stringify({ value: val, timestamp: Date.now() }));
                    }}
                    placeholder="请输入 Gemini API Key"
                    className="flex-1"
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    onClick={() => fetchModels(apiKey)}
                    disabled={!apiKey || loadingModels}
                    className="gap-2"
                  >
                    {loadingModels ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    验证
                  </Button>
                </div>
                {(modelStatus || modelError) && (
                  <div className="flex items-center gap-2 text-sm">
                    {modelError ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-destructive" />
                        <span className="text-destructive">{modelError}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-muted-foreground">{modelStatus}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              {/* Model Selection */}
              <div className="space-y-3">
                <Label htmlFor="model-select" className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  选择模型
                </Label>
                {loadingModels ? (
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-muted-foreground">正在加载模型列表...</span>
                  </div>
                ) : (
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(m => (
                        <SelectItem key={m.name} value={m.name}>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Gemini
                            </Badge>
                            {m.name.replace(/^models\//, '')}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {/* Prompt Input */}
              <div className="space-y-3">
                <Label htmlFor="prompt-textarea" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Prompt
                </Label>
                <Textarea
                  id="prompt-textarea"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="输入你要发送的提示..."
                  className="min-h-24 resize-vertical"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={!apiKey || !prompt || !selectedModel}
              >
                <Send className="w-4 h-4" />
                发送请求
              </Button>
            </form>
            {/* Response Section */}
            <div className="space-y-3 border-t pt-6">
              <Label className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                AI 回复内容
              </Label>
              <div className="bg-muted/30 border rounded-lg p-4 min-h-32 whitespace-pre-wrap leading-relaxed">
                {displayedResult}
              </div>
            </div>
          </GlowCard>
          {/* Usage Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <GlowCard className="mt-8 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">使用说明</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 shrink-0" />
                  API Key 可在 Google Cloud Console 获取
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 shrink-0" />
                  API 响应可能需要几秒到几十秒不等，请耐心等待
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 shrink-0" />
                  响应结果将以格式化文本展示
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 shrink-0" />
                  请勿在公共网络环境下泄露你的 API Key
                </li>
              </ul>
            </GlowCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
