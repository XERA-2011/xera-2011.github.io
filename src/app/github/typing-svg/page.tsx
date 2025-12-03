"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import GlowCard from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';

const DEFAULT_CONFIG = {
  font: 'monospace',
  size: '24',
  color: '36BCF7',
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
  weight: '400',
};

export default function TypingSVGPage() {
  usePageTitle('打字机效果 SVG');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [baseUrl, setBaseUrl] = useState<string>('');

  // 配置状态
  const [config, setConfig] = useState({
    lines: 'Hello World!;Welcome to XERA-2011;Typing SVG Generator',
    font: 'monospace',
    size: '24',
    color: '36BCF7',
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
    weight: '400',
  });

  // 设置 baseUrl（仅在客户端运行）
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // 生成预览 URL
  useEffect(() => {
    if (!baseUrl) return;

    const params = new URLSearchParams();

    // 必填项
    params.append('lines', config.lines);

    // 可选项：只有当值不等于默认值时才添加
    if (config.font !== DEFAULT_CONFIG.font) params.append('font', config.font);
    if (config.size !== DEFAULT_CONFIG.size) params.append('size', config.size);
    if (config.color !== DEFAULT_CONFIG.color) params.append('color', config.color);
    if (config.background !== DEFAULT_CONFIG.background) params.append('background', config.background);
    if (config.width !== DEFAULT_CONFIG.width) params.append('width', config.width);
    if (config.height !== DEFAULT_CONFIG.height) params.append('height', config.height);
    if (config.center !== DEFAULT_CONFIG.center) params.append('center', config.center.toString());
    if (config.vCenter !== DEFAULT_CONFIG.vCenter) params.append('vCenter', config.vCenter.toString());
    if (config.multiline !== DEFAULT_CONFIG.multiline) params.append('multiline', config.multiline.toString());
    if (config.duration !== DEFAULT_CONFIG.duration) params.append('duration', config.duration);
    if (config.pause !== DEFAULT_CONFIG.pause) params.append('pause', config.pause);
    if (config.repeat !== DEFAULT_CONFIG.repeat) params.append('repeat', config.repeat.toString());
    if (config.letterSpacing !== DEFAULT_CONFIG.letterSpacing) params.append('letterSpacing', config.letterSpacing);
    if (config.weight !== DEFAULT_CONFIG.weight) params.append('weight', config.weight);

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

  const paramsString = previewUrl.split('?')[1] || '';
  const shareUrl = baseUrl ? `${baseUrl}/github/typing-svg?${paramsString}` : '';

  const markdownCode = baseUrl ? `[![Typing SVG](${previewUrl})](${shareUrl})` : '';
  const htmlCode = baseUrl ? `<a href="${shareUrl}"><img alt="Typing SVG" src="${previewUrl}" /></a>` : '';

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
            <div className="bg-secondary border border-border rounded-lg p-6 flex items-center justify-center min-h-[150px]">
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
                    文本内容（用分号分隔多行）
                  </label>
                  <textarea
                    value={config.lines}
                    onChange={(e) => setConfig({ ...config, lines: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground min-h-20"
                    placeholder="第一行;第二行;第三行"
                  />
                </div>

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
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.center}
                      onChange={(e) => setConfig({ ...config, center: e.target.checked })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-foreground">水平居中</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.vCenter}
                      onChange={(e) => setConfig({ ...config, vCenter: e.target.checked })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-foreground">垂直居中</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.multiline}
                      onChange={(e) => setConfig({ ...config, multiline: e.target.checked })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-foreground">多行模式</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.repeat}
                      onChange={(e) => setConfig({ ...config, repeat: e.target.checked })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-foreground">循环播放</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.weight === 'bold'}
                      onChange={(e) => setConfig({ ...config, weight: e.target.checked ? 'bold' : '400' })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-foreground">是否加粗</span>
                  </div>
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
                    <div><code className="bg-secondary px-1 rounded">center</code> - 水平居中（true/false）</div>
                    <div><code className="bg-secondary px-1 rounded">vCenter</code> - 垂直居中（true/false）</div>
                    <div><code className="bg-secondary px-1 rounded">multiline</code> - 多行模式（true/false）</div>
                    <div><code className="bg-secondary px-1 rounded">duration</code> - 打字时长（毫秒）</div>
                    <div><code className="bg-secondary px-1 rounded">pause</code> - 暂停时长（毫秒）</div>
                    <div><code className="bg-secondary px-1 rounded">repeat</code> - 循环播放（true/false）</div>
                    <div><code className="bg-secondary px-1 rounded">weight</code> - 字体粗细（400/bold）</div>
                  </div>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </div>

        {/* Examples */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8"
        >
          <GlowCard className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">示例</h3>

            <div className="space-y-6">
              {baseUrl && (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">基础用法</p>
                    <div className="bg-secondary border border-border rounded-lg p-4 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${baseUrl}/api/github/typing-svg?lines=Hello+World!;Welcome+to+XERA-2011`}
                        alt="Example 1"
                        className="max-w-full"
                      />
                    </div>
                    <pre className="bg-secondary border border-border rounded-lg p-2 overflow-x-auto">
                      <code className="text-xs text-foreground">{`${baseUrl}/api/github/typing-svg?lines=Hello+World!;Welcome+to+XERA-2011`}</code>
                    </pre>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">居中显示</p>
                    <div className="bg-secondary border border-border rounded-lg p-4 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${baseUrl}/api/github/typing-svg?lines=Type+messages+everywhere!;Add+a+bio+to+your+profile!&center=true&vCenter=true&width=500&height=60`}
                        alt="Example 2"
                        className="max-w-full"
                      />
                    </div>
                    <pre className="bg-secondary border border-border rounded-lg p-2 overflow-x-auto">
                      <code className="text-xs text-foreground">{`${baseUrl}/api/github/typing-svg?lines=Type+messages+everywhere!;Add+a+bio+to+your+profile!&center=true&vCenter=true&width=500&height=60`}</code>
                    </pre>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">多行模式</p>
                    <div className="bg-secondary border border-border rounded-lg p-4 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${baseUrl}/api/github/typing-svg?lines=Line+1;Line+2;Line+3&multiline=true&width=400&height=100`}
                        alt="Example 3"
                        className="max-w-full"
                      />
                    </div>
                    <pre className="bg-secondary border border-border rounded-lg p-2 overflow-x-auto">
                      <code className="text-xs text-foreground">{`${baseUrl}/api/github/typing-svg?lines=Line+1;Line+2;Line+3&multiline=true&width=400&height=100`}</code>
                    </pre>
                  </div>
                </>
              )}
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}
