
# 科学计算器 (Scientific Calculator) 核心逻辑与测试

本文档介绍了计算器工具 (`src/app/tools/calculator`) 的核心逻辑及其验证方法。该计算器旨在提供高精度的数学运算，解决了 JavaScript 原生浮点数运算的精度问题。

## 目录结构

所有核心逻辑和测试工具均位于 `_lib/` 目录下：

- **`page.tsx`**: 计算器的 UI 界面（表现层）。
- **`_lib/engine.ts`**: 核心计算引擎（业务层），统一封装了 `mathjs` 的配置（BigNumber, precision=64）。
- **`_lib/run-tests.ts`**: 独立的自动化测试脚本，用于验证计算逻辑的准确性。

## 核心特性

- **高精度计算**: 使用 `mathjs` 的 `BigNumber` 配置，完美解决 `0.1 + 0.2 = 0.30000000000000004` 等经典精度问题。
- **科学计数法**: 智能处理极大或极小的数字。
- **复杂运算**: 支持三角函数、幂运算、开根号等。

## 如何运行测试

您可以在命令行中直接运行测试脚本来验证计算器的核心逻辑：

```bash
npx tsx src/app/tools/calculator/_lib/run-tests.ts
```

### 测试用例覆盖

测试脚本 (`run-tests.ts`) 包含并通过了以下场景：

1.  **基础运算**: 加减乘除及运算符优先级 (`2 + 3 * 4`).
2.  **浮点数精度**: 验证 `0.1 + 0.2` 是否严格等于 `0.3`。
3.  **大数处理**: 验证超过 JS 安全整数范围 (`Number.MAX_SAFE_INTEGER`) 的运算是否准确。
4.  **特殊输入**: 除以零 (`Infinity`)、复杂的括号嵌套等。
5.  **科学计数法**: 验证结果格式化是否符合预期 (如 `1e+20`)。

## 开发指南

如果您需要在项目的其他组件中复用这套高精度计算逻辑，请直接调用 `engine.ts`：

```typescript
import { evaluateExpression } from '@/app/tools/calculator/_lib/engine';

try {
  const result = evaluateExpression("sin(45 deg) ^ 2");
  console.log(result); // 输出格式化后的字符串
} catch (error) {
  console.error("无效的表达式");
}
```
