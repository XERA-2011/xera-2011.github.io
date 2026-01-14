"use client";

import { useSyncExternalStore } from "react";

/**
 * 客户端挂载检测 hook
 * 使用 useSyncExternalStore 来避免 ESLint react-hooks/set-state-in-effect 警告
 * 这是 Next.js App Router 中处理 hydration 的推荐方式
 */
function subscribe() {
    // 无需订阅，因为挂载状态不会改变
    return () => { };
}

function getSnapshot() {
    return true;
}

function getServerSnapshot() {
    return false;
}

export function useHasMounted(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
