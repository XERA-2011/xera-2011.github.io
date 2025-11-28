/**
 * GitHub Top Languages 图表布局组件
 * 包含多种布局方式：垂直、水平、环形、云形
 */

export interface LanguageItem {
  name: string;
  bytes: number;
  percentage: string;
  color: string;
}

export type Theme = {
  bg: string;
  border: string;
  title: string;
  text: string;
  progressBg: string;
};

/**
 * 渲染垂直布局的 SVG 图表
 * @param languages 语言数据数组
 * @param theme 主题配置
 * @param hideBorder 是否隐藏边框
 * @returns SVG 字符串
 */
export function renderVerticalLayout(languages: LanguageItem[], theme: Theme, hideBorder: boolean): string {
  const cardWidth = 300, cardHeight = 235, padding = 16, contentWidth = 268;
  const items = languages.map((lang, i) => {
    const y = 55 + i * 30;
    const progress = (parseFloat(lang.percentage) / 100) * contentWidth;
    return `
      <text x="${padding}" y="${y}" class="lang-name">${lang.name}</text>
      <text x="${cardWidth - padding}" y="${y}" class="lang-name" text-anchor="end">${lang.percentage}%</text>
      <rect x="${padding}" y="${y + 7}" width="${contentWidth}" height="8" rx="4" fill="${theme.progressBg}"/>
      <rect x="${padding}" y="${y + 7}" width="${progress}" height="8" rx="4" fill="${lang.color}"/>`;
  }).join('');
  return `
    <svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" xmlns="http://www.w3.org/2000/svg" role="img">
      <style>.title{font-size:14px;font-weight:600;fill:${theme.title}} .lang-name{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;fill:${theme.text}}</style>
      <rect width="100%" height="100%" fill="${theme.bg}" rx="12" ${hideBorder ? '' : `stroke="${theme.border}"`}/>
      <text x="16" y="28" class="title">Most Used Languages</text>
      <g>${items}</g>
    </svg>`;
}

/**
 * 渲染水平布局的 SVG 图表
 * @param languages 语言数据数组
 * @param theme 主题配置
 * @param hideBorder 是否隐藏边框
 * @returns SVG 字符串
 */
export function renderHorizontalLayout(languages: LanguageItem[], theme: Theme, hideBorder: boolean): string {
  const cardWidth = 300, cardHeight = 135, padding = 16, contentWidth = 268;
  const totalColoredWidth = languages.reduce((sum, lang) => sum + (parseFloat(lang.percentage) / 100) * contentWidth, 0);
  let currentX = padding;
  const progressBars = languages.map(lang => {
    const width = (parseFloat(lang.percentage) / 100) * contentWidth;
    const bar = `<rect x="${currentX}" y="45" height="10" width="${width}" fill="${lang.color}"/>`;
    currentX += width;
    return bar;
  }).join('');
  const legendItems = languages.map((lang, i) => {
    const x = (i % 2 === 0) ? 16 : 160;
    const y = 75 + Math.floor(i / 2) * 20;
    return `<g transform="translate(${x}, ${y})"><circle r="5" fill="${lang.color}"/><text x="10" class="legend-text">${lang.name} <tspan class="legend-percent">${lang.percentage}%</tspan></text></g>`;
  }).join('');
  return `
      <svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" xmlns="http://www.w3.org/2000/svg" role="img">
          <style>.title{font-size:14px;font-weight:600;fill:${theme.title}} .legend-text{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;dominant-baseline:middle;fill:${theme.text}}</style>
          <rect width="100%" height="100%" fill="${theme.bg}" rx="12" ${hideBorder ? '' : `stroke="${theme.border}"`}/>
          <text x="16" y="28" class="title">Most Used Languages</text>
          <rect x="16" y="45" height="10" width="268" rx="5" fill="${theme.progressBg}"/>
          <defs><clipPath id="colored-bar-clip"><rect x="16" y="45" height="10" width="${totalColoredWidth}" rx="5"/></clipPath></defs>
          <g clip-path="url(#colored-bar-clip)">${progressBars}</g>
          <g>${legendItems}</g>
      </svg>`;
}

/**
 * 渲染环形布局的 SVG 图表
 * @param languages 语言数据数组
 * @param theme 主题配置
 * @param hideBorder 是否隐藏边框
 * @returns SVG 字符串
 */
export function renderDonutLayout(languages: LanguageItem[], theme: Theme, hideBorder: boolean): string {
  const cardWidth = 300, cardHeight = 140, radius = 45, circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;
  const segments = languages.map(lang => {
    const percentage = parseFloat(lang.percentage);
    const dash = (percentage / 100) * circumference;
    const offset = (accumulatedPercentage / 100) * circumference;
    accumulatedPercentage += percentage;

    // **关键修复 1**: 为甜甜圈的圆环加上 class="donut-segment"
    return `<circle class="donut-segment" r="${radius}" stroke="${lang.color}" stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="-${offset}"/>`;
  }).join('');

  const legendYStart = (cardHeight - (languages.length * 18)) / 2 + 5;
  const legend = languages.map((lang, i) =>
    // 图例的小圆点没有 class，所以不会被样式影响
    `<g transform="translate(0, ${i * 18})"><circle cx="5" cy="0" r="5" fill="${lang.color}"/><text x="15">${lang.name} ${lang.percentage}%</text></g>`
  ).join('');

  return `
      <svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" xmlns="http://www.w3.org/2000/svg" role="img">
          <style>
            /* **关键修复 2**: 将选择器从全局的 'circle' 改为精确的 '.donut-segment' */
            .donut-segment { fill: transparent; stroke-width: 20; }
            text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; dominant-baseline: middle; fill: ${theme.text}; }
          </style>
          <rect width="100%" height="100%" fill="${theme.bg}" rx="12" ${hideBorder ? '' : `stroke="${theme.border}"`}/>
          <g transform="translate(70, 70) rotate(-90)">
            ${segments}
          </g>
          <g transform="translate(150, ${legendYStart})">
            ${legend}
          </g>
      </svg>`;
}



/**
 * 渲染云形布局的 SVG 图表
 * @param languages 语言数据数组
 * @param theme 主题配置
 * @param hideBorder 是否隐藏边框
 * @returns SVG 字符串
 */
export function renderCloudLayout(languages: LanguageItem[], theme: Theme, hideBorder: boolean): string {
  const cardWidth = 300;
  const cardHeight = 140;
  const padding = 15;
  const lineSpacing = 45;
  const horizontalGap = 15;

  const fontConfigs = [
    { size: 24, weight: 700 }, { size: 20, weight: 600 },
    { size: 18, weight: 500 }, { size: 17, weight: 500 },
    { size: 16, weight: 500 }, { size: 15, weight: 500 },
  ];

  // --- PASS 1: Measurement ---
  // Group languages into lines and calculate the width of each line.
  const lines: { lang: LanguageItem; config: typeof fontConfigs[0] }[][] = [[]];
  const lineWidths: number[] = [0];
  let currentLineIndex = 0;

  languages.forEach((lang, i) => {
    const config = fontConfigs[i];
    const estimatedWidth = lang.name.length * (config.size * 0.65) + horizontalGap;

    if (lineWidths[currentLineIndex] + estimatedWidth > cardWidth - padding * 2 && lines[currentLineIndex].length > 0) {
      // Move to the next line
      currentLineIndex++;
      lines[currentLineIndex] = [];
      lineWidths[currentLineIndex] = 0;
    }

    lines[currentLineIndex].push({ lang, config });
    lineWidths[currentLineIndex] += estimatedWidth;
  });

  // Remove the last gap from each line's width for accurate centering
  lineWidths.forEach((width, index) => {
    lineWidths[index] = width - horizontalGap;
  });

  // --- PASS 2: Rendering ---
  // Calculate the starting positions for true centering.
  const totalContentHeight = (lines.length - 1) * lineSpacing + fontConfigs[0].size;
  const startY = (cardHeight - totalContentHeight) / 2;

  let itemsSvg = '';
  lines.forEach((line, lineIndex) => {
    const lineY = startY + lineIndex * lineSpacing;
    let currentX = (cardWidth - lineWidths[lineIndex]) / 2; // Center this specific line

    line.forEach(item => {
      const { lang, config } = item;
      const estimatedWidth = lang.name.length * (config.size * 0.65);

      itemsSvg += `
              <a href="#" class="tag">
                <text x="${currentX}" y="${lineY}" font-size="${config.size}" font-weight="${config.weight}" fill="${lang.color}">${lang.name}</text>
              </a>
            `;
      currentX += estimatedWidth + horizontalGap;
    });
  });

  return `
      <svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg" role="img">
          <style>
            .tag { transition: opacity 0.2s ease; cursor: pointer; }
            .tag:hover { opacity: 0.7; }
            text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; dominant-baseline: hanging; }
          </style>
          <rect width="100%" height="100%" fill="${theme.bg}" rx="12" ${hideBorder ? '' : `stroke="${theme.border}"`}/>
          <g text-anchor="start">
            ${itemsSvg}
          </g>
      </svg>`;
}


/**
 * 渲染错误信息的 SVG 卡片
 * @param message 错误信息
 * @param theme 主题配置
 * @returns SVG 字符串
 */
export function renderErrorCard(message: string, theme: Theme): string {
  return `
    <svg width="450" height="120" viewBox="0 0 450 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${theme.bg}" rx="12" stroke="${theme.border}"/>
      <text x="50%" y="50%" font-family="-apple-system,sans-serif" font-size="16" fill="#ef4444" text-anchor="middle" dominant-baseline="middle">${message}</text>
    </svg>`;
}