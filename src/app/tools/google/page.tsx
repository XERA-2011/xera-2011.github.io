'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';

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
    const stored = localStorage.getItem('google_api_key_obj');
    if (stored) {
      try {
        const obj = JSON.parse(stored);
        if (obj.value && obj.timestamp) {
          const now = Date.now();
          const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
          if (now - obj.timestamp < THIRTY_DAYS) {
            setApiKey(obj.value);
          } else {
            localStorage.removeItem('google_api_key_obj');
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
    <div className="relative w-full min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Gemini API
          </h2>
        </motion.div>

        <div className="p-6 flex flex-col gap-6">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="api-key-input" className="font-semibold text-neutral-300">API Key</label>
              <div className="flex gap-2">
                <input
                  id="api-key-input"
                  type="text"
                  value={apiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setApiKey(val);
                    localStorage.setItem('google_api_key_obj', JSON.stringify({ value: val, timestamp: Date.now() }));
                  }}
                  placeholder="请输入 Google API Key"
                  className="flex-1 px-3 py-2 rounded border border-neutral-700 bg-neutral-800 text-neutral-100 focus:outline-none focus:border-white mb-2"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="py-2 px-4 rounded text-neutral-900 font-semibold transition border border-neutral-300 mb-2"
                  onClick={() => fetchModels(apiKey)}
                  disabled={!apiKey || loadingModels}
                >
                  确认
                </button>
              </div>
              {(modelStatus || modelError) && (
                <div className="text-sm mt-1">
                  {modelStatus && <span className="text-neutral-400">{modelStatus}</span>}
                  {modelError && <span className="text-red-400 ml-2">{modelError}</span>}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="model-select" className="font-semibold text-neutral-300">选择模型</label>
              {loadingModels
                ? <p className="mb-2">正在加载模型列表…</p>
                : (
                  <select
                    id="model-select"
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-neutral-700 bg-neutral-800 text-neutral-100 focus:outline-none focus:border-white mb-2"
                  >
                    {models.map(m => (
                      <option key={m.name} value={m.name}>
                        {m.name.replace(/^models\//, '')}
                      </option>
                    ))}
                  </select>
                )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="prompt-textarea" className="font-semibold text-neutral-300">Prompt</label>
              <textarea
                id="prompt-textarea"
                rows={4}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="输入你要发送的提示"
                className="w-full h-24 px-3 py-2 rounded border border-neutral-700 bg-neutral-800 text-neutral-100 resize-vertical focus:outline-none focus:border-white mb-2"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded bg-white text-neutral-900 font-semibold transition hover:bg-neutral-200 border border-neutral-300"
            >
              发送请求
            </button>
          </form>
          <div className="w-full mt-2">
            <h2 className="mb-2 text-lg font-semibold text-neutral-300">AI回复内容</h2>
            <div className="bg-green-100 border border-green-400 text-green-900 px-4 py-3 rounded mb-2 whitespace-pre-wrap leading-relaxed">
              {displayedResult}
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-neutral-400 p-4">
          <h3 className="font-bold text-neutral-300 mb-2">使用说明</h3>
          <ul className="list-disc pl-5 mb-0">
            <li>API Key 可在 Google Cloud Console 获取</li>
            <li>API 响应可能需要几秒到几十秒不等，请耐心等待</li>
            <li>响应结果将以格式化文本展示</li>
            <li>请勿在公共网络环境下泄露你的 API Key</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
