/**
 * SVG 笑话卡片渲染工具函数
 */

interface QnACardOptions {
  question: string;
  answer: string;
  questionZh?: string; // 中文问题
  answerZh?: string;   // 中文答案
  qColor: string;
  aColor: string;
  bgColor: string;
  borderColor: string;
  codeColor: string;
  hideBorder?: boolean;
  width?: number;  // 卡片宽度
  height?: number; // 卡片高度
}

interface QuoteCardOptions {
  text: string;
  textZh?: string; // 中文文本
  textColor: string;
  bgColor: string;
  borderColor: string;
  codeColor: string;
  hideBorder?: boolean;
  width?: number;  // 卡片宽度
  height?: number; // 卡片高度
}

/**
 * 渲染 QnA 类型的笑话卡片
 */
export function renderQnACard(options: QnACardOptions): string {
  const {
    question,
    answer,
    qColor,
    aColor,
    bgColor,
    borderColor,
    codeColor,
    hideBorder = false,
    width = 500,
    height = 200,
  } = options;

  const border = hideBorder ? '2px solid transparent' : `2px solid ${borderColor}`;

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <foreignObject width="${width}" height="${height}">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <style>
        .container {
          width: ${width}px;
          height: ${height}px;
          border: ${border};
          border-radius: 10px;
          background: ${bgColor};
          box-sizing: border-box;
        }
        .text {
          padding: 1rem;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14px;
          height: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }
        .question {
          color: ${qColor};
          margin-bottom: 0.5rem;
        }
        .answer {
          color: ${aColor};
        }
        .question p, .answer p {
          margin: 0;
          line-height: 1.5;
        }
        .zh {
          margin-top: 2px;
          opacity: 0.85;
          font-size: 0.9em;
        }
        code {
          font-size: 1.1em;
          color: ${codeColor};
        }
      </style>
      <div class="container">
        <div class="text">
          <div class="question">
            <p><b>Q.</b> ${question}</p>
            ${options.questionZh ? `<p class="zh">问：${options.questionZh}</p>` : ''}
          </div>
          <div class="answer">
            <p><b>A.</b> ${answer}</p>
            ${options.answerZh ? `<p class="zh">答：${options.answerZh}</p>` : ''}
          </div>
        </div>
      </div>
    </div>
  </foreignObject>
</svg>`;
}

/**
 * 渲染引用类型的笑话卡片
 */
export function renderQuoteCard(options: QuoteCardOptions): string {
  const {
    text,
    textColor,
    bgColor,
    borderColor,
    codeColor,
    hideBorder = false,
    width = 500,
    height = 150,
  } = options;

  const border = hideBorder ? '2px solid transparent' : `2px solid ${borderColor}`;

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <foreignObject width="${width}" height="${height}">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <style>
        .container {
          width: ${width}px;
          height: ${height}px;
          border: ${border};
          border-radius: 10px;
          background: ${bgColor};
          box-sizing: border-box;
        }
        .text {
          padding: 1rem;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14px;
          height: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }
        .quote {
          color: ${textColor};
        }
        .quote p {
          margin: 0;
          line-height: 1.5;
        }
        .zh {
          margin-top: 2px;
          opacity: 0.85;
          font-size: 0.9em;
        }
        code {
          font-size: 1.1em;
          color: ${codeColor};
        }
      </style>
      <div class="container">
        <div class="text">
          <div class="quote">
            <p>${text}</p>
            ${options.textZh ? `<p class="zh">${options.textZh}</p>` : ''}
          </div>
        </div>
      </div>
    </div>
  </foreignObject>
</svg>`;
}
