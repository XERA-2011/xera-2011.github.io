"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { usePageTitle } from '@/hooks/use-page-title';
import GlowCard from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';
import { CheckboxWithLabel } from '@/components/ui/checkbox-with-label';

export default function TypingSVGPage() {
  usePageTitle('打字机效果 SVG');
  const { theme } = useTheme();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [baseUrl, setBaseUrl] = useState<string>('');

  // 根据主题获取默认文字颜色
  const getDefaultTextColor = useCallback(() => {
    return theme === 'dark' ? 'FFFFFF' : '000000';
  }, [theme]);

  // 配置状态
  const [config, setConfig] = useState({
    type: 'custom',
    lines: 'Hello World!;Welcome to XERA-2011;Typing SVG Generator',
    font: 'monospace',
    size: '24',
    color: getDefaultTextColor(),
    background: '00000000',
    width: '600',
    height: '100',
    center: true,
    vCenter: true,
    multiline: false,
    duration: '5000',
    pause: '1000',
    repeat: true,
    letterSpacing: 'normal',
    bold: true,
  });

  // 设置 baseUrl（仅在客户端运行）
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // 当主题变化时更新文字颜色
  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      color: getDefaultTextColor(),
    }));
  }, [getDefaultTextColor]);

  // 生成预览 URL
  useEffect(() => {
    if (!baseUrl) return;

    const params = new URLSearchParams({
      font: config.font,
      size: config.size,
      color: config.color,
      background: config.background,
      width: config.width,
      height: config.height,
      center: config.center.toString(),
      vCenter: config.vCenter.toString(),
      multiline: config.multiline.toString(),
      duration: config.duration,
      pause: config.pause,
      repeat: config.repeat.toString(),
      letterSpacing: config.letterSpacing,
      bold: config.bold.toString(),
    });

    if (config.type === 'movie-quotes' || config.type === 'famous-quotes') {
      params.set('type', config.type);
    } else {
      params.set('lines', config.lines);
    }

    setPreviewUrl(`${baseUrl}/api/github/typing-svg?${params.toString()}`);
    setRefreshKey(Date.now());
  }, [config, baseUrl]);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const markdownCode = baseUrl ? `[![Typing SVG](${previewUrl})](${baseUrl}/github/typing-svg)` : '';
  const htmlCode = baseUrl ? `<img alt="Typing SVG" src="${previewUrl}" />` : '';

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            打字机效果 SVG
          </h2>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <GlowCard className="p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">实时预览</h3>
            <div className="bg-secondary border border-border rounded-lg p-6 flex items-center justify-center min-h-37.5">
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${previewUrl}&t=${refreshKey}`}
                  alt="Typing SVG Preview"
                  className="max-w-full"
                />
              )}
            </div>
          </GlowCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <GlowCard className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">配置选项</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    模式
                  </label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={config.type === 'custom'}
                        onChange={() => setConfig({ ...config, type: 'custom' })}
                        className="accent-primary"
                      />
                      <span className="text-foreground">自定义文本</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={config.type === 'movie-quotes'}
                        onChange={() => setConfig({
                          ...config,
                          type: 'movie-quotes',
                          font: 'monospace',
                          size: '14',
                          width: '750',
                          height: '52',
                          repeat: true,
                          center: true,
                          vCenter: true,
                          multiline: true,
                          duration: '5000',
                          pause: '1000',
                          letterSpacing: 'normal',
                          bold: true
                        })}
                        className="accent-primary"
                      />
                      <span className="text-foreground">随机电影台词</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={config.type === 'famous-quotes'}
                        onChange={() => setConfig({
                          ...config,
                          type: 'famous-quotes',
                          font: 'monospace',
                          size: '14',
                          width: '750',
                          height: '52',
                          repeat: true,
                          center: true,
                          vCenter: true,
                          multiline: true,
                          duration: '5000',
                          pause: '1000',
                          letterSpacing: 'normal',
                          bold: true
                        })}
                        className="accent-primary"
                      />
                      <span className="text-foreground">随机名人名言</span>
                    </label>
                  </div>
                </div>

                {config.type === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      文本内容（用分号分隔多行）
                    </label>
                    <textarea
                      value={config.lines}
                      onChange={(e) => setConfig({ ...config, lines: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground min-h-20"
                      placeholder="第一行;第二行;第三行"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      字体大小 (px)
                    </label>
                    <input
                      type="number"
                      value={config.size}
                      onChange={(e) => setConfig({ ...config, size: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      字体
                    </label>
                    <input
                      type="text"
                      value={config.font}
                      onChange={(e) => setConfig({ ...config, font: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground"
                      placeholder="monospace"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      文字颜色
                      <button
                        onClick={() => setConfig({ ...config, color: getDefaultTextColor() })}
                        className="ml-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        title="使用主题默认颜色"
                      >
                        (跟随主题)
                      </button>
                    </label>
                    <div className="flex gap-2">
                      <span className="bg-secondary border border-border rounded-lg px-3 py-2 text-foreground">#</span>
                      <input
                        type="text"
                        value={config.color}
                        onChange={(e) => setConfig({ ...config, color: e.target.value })}
                        className="flex-1 bg-secondary border border-border rounded-lg p-2 text-foreground"
                        placeholder="36BCF7"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      背景颜色
                    </label>
                    <div className="flex gap-2">
                      <span className="bg-secondary border border-border rounded-lg px-3 py-2 text-foreground">#</span>
                      <input
                        type="text"
                        value={config.background}
                        onChange={(e) => setConfig({ ...config, background: e.target.value })}
                        className="flex-1 bg-secondary border border-border rounded-lg p-2 text-foreground"
                        placeholder="00000000"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      宽度 (px)
                    </label>
                    <input
                      type="number"
                      value={config.width}
                      onChange={(e) => setConfig({ ...config, width: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      高度 (px)
                    </label>
                    <input
                      type="number"
                      value={config.height}
                      onChange={(e) => setConfig({ ...config, height: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      打字时长 (ms)
                    </label>
                    <input
                      type="number"
                      value={config.duration}
                      onChange={(e) => setConfig({ ...config, duration: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      暂停时长 (ms)
                    </label>
                    <input
                      type="number"
                      value={config.pause}
                      onChange={(e) => setConfig({ ...config, pause: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <CheckboxWithLabel
                    checked={config.bold}
                    onCheckedChange={(checked) => setConfig({ ...config, bold: checked })}
                    label="加粗文字"
                  />
                  <CheckboxWithLabel
                    checked={config.center}
                    onCheckedChange={(checked) => setConfig({ ...config, center: checked })}
                    label="水平居中"
                  />
                  <CheckboxWithLabel
                    checked={config.vCenter}
                    onCheckedChange={(checked) => setConfig({ ...config, vCenter: checked })}
                    label="垂直居中"
                  />
                  <CheckboxWithLabel
                    checked={config.multiline}
                    onCheckedChange={(checked) => setConfig({ ...config, multiline: checked })}
                    label="多行模式"
                  />
                  <CheckboxWithLabel
                    checked={config.repeat}
                    onCheckedChange={(checked) => setConfig({ ...config, repeat: checked })}
                    label="循环播放"
                  />
                </div>
              </div>
            </GlowCard>
          </motion.div>

          {/* Code Output */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <GlowCard className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">使用代码</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Markdown</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(markdownCode, 0)}
                    >
                      {copiedIndex === 0 ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          已复制
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          复制
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-secondary border border-border rounded-lg p-3 overflow-x-auto">
                    <code className="text-xs text-foreground break-all">{markdownCode}</code>
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">HTML</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(htmlCode, 1)}
                    >
                      {copiedIndex === 1 ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          已复制
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          复制
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-secondary border border-border rounded-lg p-3 overflow-x-auto">
                    <code className="text-xs text-foreground break-all">{htmlCode}</code>
                  </pre>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">参数说明</h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div><code className="bg-secondary px-1 rounded">lines</code> - 文本内容，使用分号分隔多行</div>
                    <div><code className="bg-secondary px-1 rounded">font</code> - 字体名称（支持 Google Fonts）</div>
                    <div><code className="bg-secondary px-1 rounded">size</code> - 字体大小（像素）</div>
                    <div><code className="bg-secondary px-1 rounded">color</code> - 文字颜色（十六进制，不含 #）</div>
                    <div><code className="bg-secondary px-1 rounded">background</code> - 背景颜色（十六进制，不含 #）</div>
                    <div><code className="bg-secondary px-1 rounded">width / height</code> - SVG 尺寸（像素）</div>
                    <div><code className="bg-secondary px-1 rounded">bold</code> - 加粗文字（true/false）</div>
                    <div><code className="bg-secondary px-1 rounded">center</code> - 水平居中（true/false）</div>
                    <div><code className="bg-secondary px-1 rounded">vCenter</code> - 垂直居中（true/false）</div>
                    <div><code className="bg-secondary px-1 rounded">multiline</code> - 多行模式（true/false）</div>
                    <div><code className="bg-secondary px-1 rounded">duration</code> - 打字时长（毫秒）</div>
                    <div><code className="bg-secondary px-1 rounded">pause</code> - 暂停时长（毫秒）</div>
                    <div><code className="bg-secondary px-1 rounded">repeat</code> - 循环播放（true/false）</div>
                  </div>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
