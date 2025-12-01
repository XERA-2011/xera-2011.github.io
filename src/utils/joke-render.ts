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
}

interface QuoteCardOptions {
  text: string;
  textZh?: string; // 中文文本
  textColor: string;
  bgColor: string;
  borderColor: string;
  codeColor: string;
  hideBorder?: boolean;
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
  } = options;

  const border = hideBorder ? '2px solid transparent' : `2px solid ${borderColor}`;

  return `
<svg class="" onload="initCard()" id="qna" fill="none" xmlns="http://www.w3.org/2000/svg">
  <script>
    const initCard = () => {
      const text = document.getElementsByClassName("text");
      const qnaCard = document.getElementById("qna");
      if (window.screen.availWidth > 425) {
        text[0].classList.add("desktop");
        qnaCard.classList.add("qwidthDesktop");
      } else {
        text[0].classList.add("mobile");
        qnaCard.classList.add("qwidthMobile");
      }
    }
  </script>
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <style>
        .qwidthDesktop {
          width: 500px;
        }
        .qwidthMobile {
          width: 80%;
        }
        .container {
          border: ${border};
          border-radius: 10px;
          background: ${bgColor};
        }
        .desktop {
          font-size: 18px;
        }
        .mobile {
          font-size: 45px;
        }
        .text {
          padding: 0.5rem;
          font-family: Arial, Helvetica, sans-serif;
        }
        .question {
          color: ${qColor};
        }
        .answer {
          color: ${aColor};
        }
        .zh {
          margin-top: 0.3rem;
          opacity: 0.85;
          font-size: 0.9em;
        }
        code {
          font-size: 1.2rem;
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
  } = options;

  const border = hideBorder ? '2px solid transparent' : `2px solid ${borderColor}`;

  return `
<svg class="" onload="initCard()" id="quoteC" fill="none" xmlns="http://www.w3.org/2000/svg">
  <script>
    const initCard = () => {
      const text = document.getElementsByClassName("text");
      const quoteCard = document.getElementById("quoteC");
      if (window.screen.availWidth > 425) {
        text[0].classList.add("desktop");
        quoteCard.classList.add("qwidthDesktop");
      } else {
        text[0].classList.add("mobile");
        quoteCard.classList.add("qwidthMobile");
      }
    }
  </script>
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <style>
        .qwidthDesktop {
          width: 500px;
        }
        .qwidthMobile {
          width: 80%;
        }
        .container {
          border: ${border};
          border-radius: 10px;
          background: ${bgColor};
        }
        .desktop {
          font-size: 18px;
        }
        .mobile {
          font-size: 45px;
        }
        .text {
          padding: 0.5rem;
          font-family: Arial, Helvetica, sans-serif;
        }
        .quote {
          color: ${textColor};
        }
        .zh {
          margin-top: 0.3rem;
          opacity: 0.85;
          font-size: 0.9em;
        }
        code {
          font-size: 1.2rem;
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
