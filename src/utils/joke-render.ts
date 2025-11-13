/**
 * SVG 笑话卡片渲染工具函数
 */

interface QnACardOptions {
  question: string;
  answer: string;
  qColor: string;
  aColor: string;
  bgColor: string;
  borderColor: string;
  codeColor: string;
  hideBorder?: boolean;
}

interface QuoteCardOptions {
  text: string;
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
        code {
          font-size: 1.2rem;
          color: ${codeColor};
        }
      </style>
      <div class="container">
        <div class="text">
          <p class="question"><b>Q.</b> ${question}</p>
          <p class="answer"><b>A.</b> ${answer}</p>
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
        code {
          font-size: 1.2rem;
          color: ${codeColor};
        }
      </style>
      <div class="container">
        <div class="text">
          <p class="quote">${text}</p>
        </div>
      </div>
    </div>
  </foreignObject>
</svg>`;
}
