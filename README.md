# XERA-2011

## Requirements

- Node.js 22+
- pnpm

## Installation

```bash
npm install pnpm -g
pnpm config set registry https://registry.npmmirror.com # ignorable
pnpm config set registry https://registry.npmjs.org # ignorable
pnpm install
```

## Run

```bash
pnpm dev

pnpm dev:proxy
```

## Deploy

```bash
pnpm build
```

## Audit

```bash
pnpm audit
```

## Eslint

```bash
pnpm up eslint
```

## [shadcn/ui](https://ui.shadcn.com/)

**Adding new components:**
```bash
# Add a specific component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add card dialog dropdown-menu
```

## Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 列出环境变量
vercel env ls

# 下载环境变量
vercel env pull .env.local

```

## Qwen Code

```bash
npm install -g @qwen-code/qwen-code@latest
qwen --version
```

## Gemini cli

```bash
npx https://github.com/google-gemini/gemini-cli

or

npm install -g @google/gemini-cli

or

brew install gemini-cli

# win
set GEMINI_API_KEY=YOUR_API_KEY
# mac
export GEMINI_API_KEY=YOUR_API_KEY

gemini
```

## Claude Code

```bash
npm install -g @anthropic-ai/claude-code

claude --version

# 有时候遇到问题了，就得强制删除，然后重新安装
rm -rf /Users/xera/.nvm/versions/node/v24.5.0/lib/node_modules/@anthropic-ai/claude-code

# win
$env:ANTHROPIC_AUTH_TOKEN = ""
$env:ANTHROPIC_BASE_URL = ""
echo $env:ANTHROPIC_AUTH_TOKEN
echo $env:ANTHROPIC_BASE_URL

# mac
export ANTHROPIC_AUTH_TOKEN=
export ANTHROPIC_BASE_URL=

claude

```
