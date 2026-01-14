import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // Next.js hydration 模式常用 setMounted(true) 在 useEffect 中
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // 自定义规则
      // 'react/no-unescaped-entities': 'off',
      // '@next/next/no-page-custom-font': 'off',
    },
  },
];

export default eslintConfig;
