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

## Vercel

```bash
# 安装 Vercel CLI
pnpm install -g vercel

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
