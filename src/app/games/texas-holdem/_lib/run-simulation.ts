
import { generateMatchReports } from './test-utils';

console.log("正在执行德州扑克引擎随机测试...");
try {
    const reports = generateMatchReports(10);
    console.log("测试完成。生成报告如下：");
    console.log(JSON.stringify(reports, null, 2));
    
    // 简单的统计
    const invalidCount = reports.filter((r: any) => !r.valid).length;
    if (invalidCount > 0) {
        console.error(`\n警告: 发现了 ${invalidCount} 个无效的资金对局 (Pot != Payout)`);
    } else {
        console.log("\n所有 10 局测试资金结算平衡 (Valid).");
    }

} catch (e) {
    console.error("测试执行出错:", e);
}
