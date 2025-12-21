# XERA-2011

## Games (游戏)

- [Texas Hold'em (单机德州扑克)](src/app/games/texas-holdem) - A single-player Texas Hold'em game.


## Requirements

- Node.js 22+
- pnpm

## Installation

```bash
npm install pnpm -g
pnpm config set registry https://registry.npmmirror.com # ignorable
pnpm config set registry https://registry.npmjs.org # ignorable
pnpm install

# bash
rm -rf node_modules
# powershell
Remove-Item -Recurse -Force node_modules
# cmd
rmdir /s /q node_modules
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

## Docker

### Start

**Option 1: Build and Start (Recommended for first run or after code changes)**
```bash
docker-compose up -d --build
```
> Rebuilds the image to include latest code changes, then starts the containers in background.

**Option 2: Start Only (Quick start)**
```bash
docker-compose up -d
```
> Starts the containers using the existing image. Faster, but won't reflect recent code changes.

Access the application at http://localhost:2011.

> **Note**: The application connects to the local PostgreSQL container.

### Common Commands

Check running containers:
```bash
docker ps
```
> Shows active containers, their IDs, status, and ports.

View logs:
```bash
docker-compose logs -f
```

Stop services:
```bash
docker-compose down
```

Stop services and remove data (reset database):
```bash
docker-compose down -v
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

qwen
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

# 有时候遇到问题了，就得强制删除，然后重新安装，下面是 mac的例子
rm -rf /Users/xera/.nvm/versions/node/v24.5.0/lib/node_modules/@anthropic-ai/claude-code

# win 设置临时代理
set HTTP_PROXY=http://127.0.0.1:7890
set HTTPS_PROXY=http://127.0.0.1:7890
# win 设置永久代理：电脑 - 高级系统设置 - 环境变量 - 系统变量
HTTP_PROXY = http://127.0.0.1:7890
HTTPS_PROXY = http://127.0.0.1:7890

# win
$env:ANTHROPIC_AUTH_TOKEN = ""
$env:ANTHROPIC_BASE_URL = ""

# mac
export ANTHROPIC_AUTH_TOKEN=
export ANTHROPIC_BASE_URL=

claude

```
