'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { useTheme } from 'next-themes';
import { useEffect, useState, Children, isValidElement, ReactNode } from 'react';

interface MarkdownPageProps {
  content: string;
  maxWidth?: 'max-w-4xl' | 'max-w-5xl' | 'max-w-6xl' | 'max-w-none';
  withContainer?: boolean; // 是否显示外层容器
}

/**
 * 通用的 Markdown 页面组件
 * 提供默认的样式和布局，支持自定义组件覆盖
 */
export function MarkdownPage({
  content,
  maxWidth = 'max-w-4xl',
  withContainer = true
}: MarkdownPageProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 避免服务端渲染时的 hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  // Markdown 组件样式
  const components: Components = {
    h1: ({ ...props }) => <h1 className="text-3xl font-bold mb-4 text-white" {...props} />,
    h2: ({ ...props }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-white" {...props} />,
    h3: ({ ...props }) => <h3 className="text-lg font-medium mt-4 mb-2 text-white/90" {...props} />,
    ul: ({ ...props }) => <ul className="mb-4 list-none p-0 text-white/70" {...props} />,
    li: ({ ...props }) => <li className="mb-1 pl-0" {...props} />,
    hr: ({ ...props }) => <hr className="my-6 border-white/20" {...props} />,
    a: ({ ...props }) => (
      <a
        className="text-blue-400 hover:text-blue-300 underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    strong: ({ ...props }) => <strong className="font-semibold text-white" {...props} />,
    // 表格样式 - 移动端优化
    table: ({ ...props }) => (
      <div className="overflow-x-auto -mx-2 sm:mx-0 my-4">
        <table className="min-w-full border-collapse border border-white/20" {...props} />
      </div>
    ),
    thead: ({ ...props }) => <thead className="bg-white/5" {...props} />,
    tbody: ({ ...props }) => <tbody {...props} />,
    tr: ({ ...props }) => <tr className="border-b border-white/10" {...props} />,
    th: ({ ...props }) => (
      <th className="px-3 py-2 text-left text-sm font-semibold border border-white/20 text-white" {...props} />
    ),
    td: ({ ...props }) => (
      <td className="px-3 py-2 text-sm border border-white/20 text-white/70" {...props} />
    ),
    // 代码块样式 - 使用 rehype-highlight 进行语法高亮
    code: (props) => {
      const { inline, className, ...rest } = props as {
        inline?: boolean;
        className?: string;
        [key: string]: unknown
      };

      if (inline) {
        return (
          <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm text-gray-200 font-mono" {...rest} />
        );
      }

      // 块级代码使用 rehype-highlight 的样式
      return <code className={className} {...rest} />;
    },
    pre: ({ ...props }) => (
      <pre className="rounded-lg overflow-x-auto my-4 -mx-2 sm:mx-0 bg-gray-900 p-4" {...props} />
    ),
    // 块引用样式
    blockquote: ({ ...props }) => (
      <blockquote className="border-l-4 border-blue-400 pl-4 my-4 italic text-white/60" {...props} />
    ),
    // 图片样式 - 支持 SVG 等，自动代理 GitHub CDN 图片
    img: ({ src, alt, ...props }) => {
      if (!src || typeof src !== 'string') return null;

      // 如果是 GitHub CDN 图片，使用代理
      let proxiedSrc = src;
      if (src.includes('cdn.jsdelivr.net/gh/') || src.includes('raw.githubusercontent.com')) {
        proxiedSrc = `/api/redirect?url=${encodeURIComponent(src)}`;
      }

      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={proxiedSrc}
          alt={alt || ''}
          className="max-w-full h-auto rounded-lg my-4 mx-auto block"
          {...props}
        />
      );
    },
    // HTML 元素支持 - 覆盖默认样式
    p: ({ ...props }) => {
      // 检查是否有 align 属性
      const align = (props as any).align;

      // 如果是居中对齐，使用 div 而不是 p 来避免嵌套块级元素的问题
      if (align === 'center') {
        return <div className="text-base leading-7 mb-2 text-white/70 text-center" {...props} />;
      }

      return <p className="text-base leading-7 mb-2 text-white/70" {...props} />;
    },
    div: ({ ...props }) => <div {...props} />,
    // 处理 HTML picture 元素 - 根据网站主题选择正确的图片
    picture: ({ children }) => {
      // 当前主题状态
      const isDark = mounted ? resolvedTheme === 'dark' : true;

      // 解析 children 中的 source 和 img 元素
      let darkSrc = '';
      let lightSrc = '';
      let fallbackSrc = '';
      let altText = '';

      Children.forEach(children as ReactNode, (child) => {
        if (!isValidElement(child)) return;

        const childProps = child.props as Record<string, unknown>;

        if (child.type === 'source' || (typeof child.type === 'function' && child.type.name === 'source')) {
          const media = String(childProps.media || childProps.Media || '');
          const srcSet = String(childProps.srcSet || childProps.srcset || '');

          if (media.includes('dark')) {
            darkSrc = srcSet;
          } else if (media.includes('light')) {
            lightSrc = srcSet;
          }
        } else if (child.type === 'img' || (typeof child.type === 'function' && child.type.name === 'img')) {
          fallbackSrc = String(childProps.src || '');
          altText = String(childProps.alt || '');
        }
      });

      // 根据当前主题选择图片
      const selectedSrc = isDark
        ? (darkSrc || fallbackSrc)
        : (lightSrc || fallbackSrc);

      if (!selectedSrc) return null;

      // 代理 GitHub CDN 图片
      const needsProxy = selectedSrc.includes('cdn.jsdelivr.net/gh/') || selectedSrc.includes('raw.githubusercontent.com');
      const proxiedSrc = needsProxy
        ? `/api/redirect?url=${encodeURIComponent(selectedSrc)}`
        : selectedSrc;

      return (
        <div className="flex justify-center my-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proxiedSrc}
            alt={altText}
            className="max-w-full h-auto"
          />
        </div>
      );
    },
    // source 元素不再单独渲染，由 picture 统一处理
    source: () => null,

  };

  const markdownContent = (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  // 如果不需要容器，直接返回内容
  if (!withContainer) {
    return markdownContent;
  }

  // 带容器的完整页面布局
  return (
    <div className="min-h-screen pb-16 px-4">
      <div className={`mx-auto ${maxWidth} bg-card rounded-3xl p-6 md:p-8`}>
        {markdownContent}
      </div>
    </div>
  );
}
