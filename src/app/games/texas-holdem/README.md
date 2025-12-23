
# 德州扑克 (Texas Hold'em) 核心逻辑测试与验证

本文档介绍了用于验证 `poker-engine.ts` 核心游戏逻辑（特别是复杂的底池分配和赢家判定）的测试工具。

## 目录结构

所有测试工具均位于 `src/app/games/texas-holdem/_lib/` 目录下，以保持项目结构整洁并利用 Next.js 的路径忽略规则。

- **`test-utils.ts`**: 包含测试辅助类 `ScenarioTester` 和生成批量测试报告的函数 `generateMatchReports`。
- **`run-simulation.ts`**: 一个可执行脚本，用于通过命令行即时运行随机模拟测试。
- **`poker-engine.ts`**: 核心游戏引擎，其中包含用于测试的 `simulateRandomHand()` 方法。

## 什么是模拟测试 (Simulation Test)?

由于德州扑克的多人全压（Multi-way All-in）涉及复杂的边池（Side Pot）逻辑，仅靠单元测试难以覆盖所有边缘情况（例如：多个不同筹码量的玩家全压，分池顺序，多人平分奖池等）。

`simulateRandomHand()` 方法会生成一个包含 2-9 名随机机器人的“虚拟”对局，每个机器人拥有随机的初始筹码。所有人强制全压 (All-in)，引擎计算结果，最后验证：
- **资金平衡**: `总投入 (Pot)` 必须严格等于 `总回报 (Payout)`。

## 如何运行测试

您可以在命令行中使用 `npx tsx` 直接运行模拟脚本：

```bash
# 在项目根目录下运行
npx tsx src/app/games/texas-holdem/_lib/run-simulation.ts
```

### 预期输出

脚本默认会生成 **10 局** 随机对局，并打印详细的 JSON 格式报告。如果所有对局的资金结算都是平衡的，最后会输出：

```
所有 10 局测试资金结算平衡 (Valid).
```

如果有任何一局资金分配出现错误（例如少了 1 块钱），会有红色警告提示。

## 也可以在代码中调用

如果您想在其他地方（如单元测试框架或调试页面）使用此功能，可以直接导入：

```typescript
import { generateMatchReports } from './_lib/test-utils';

// 生成 100 局报告
const reports = generateMatchReports(100);

// 检查是否有失败的案例
const failures = reports.filter(r => !r.valid);
if (failures.length > 0) {
    console.error(failures);
}
```
