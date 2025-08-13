# Cloudflare Workers 部署指南

## 🚀 部署步骤

### 1. 准备环境变量

在部署之前，您需要设置以下环境变量：

#### 方法一：使用 Wrangler Secrets（推荐）

```bash
# 设置 OpenAI API 密钥
npx wrangler secret put OPENAI_API_KEY

# 设置 YouTube API 密钥  
npx wrangler secret put YOUTUBE_API_KEY
```

#### 方法二：在 wrangler.toml 中设置（不推荐用于生产环境）

编辑 `wrangler.toml` 文件，取消注释并填入您的 API 密钥：

```toml
[vars]
NODE_ENV = "production"
OPENAI_API_KEY = "your-openai-api-key"
YOUTUBE_API_KEY = "your-youtube-api-key"
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

### 3. 部署到 Cloudflare Workers

```bash
# 部署到生产环境
npx wrangler deploy

# 或者先测试部署（不会实际部署）
npx wrangler deploy --dry-run
```

### 4. 测试部署

部署成功后，您可以通过以下方式测试您的应用：

```bash
# 健康检查
curl https://subtitle-agent.YOUR_ACCOUNT.workers.dev/

# 调用字幕代理
curl -X POST https://subtitle-agent.YOUR_ACCOUNT.workers.dev/api/agents/subtitleAgent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user", 
        "content": "请处理这个YouTube视频: https://youtube.com/watch?v=VIDEO_ID"
      }
    ]
  }'

# 列出可用的代理
curl https://subtitle-agent.YOUR_ACCOUNT.workers.dev/api/agents
```

## 📋 API 端点

部署后，您的应用将提供以下 API 端点：

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/` | 健康检查 |
| POST | `/api/agents/:agentName/generate` | 调用指定的 AI Agent |
| POST | `/api/workflows/:workflowId/run` | 执行指定的工作流 |
| GET | `/api/agents` | 列出所有可用的 Agent |
| GET | `/api/workflows` | 列出所有可用的工作流 |

## 🔧 配置说明

### 可用的 Agents
- `subtitleAgent` - 字幕代理，用于处理 YouTube 视频信息
- `weatherAgent` - 天气代理，用于获取天气信息

### 可用的 Workflows
- `weatherWorkflow` - 天气工作流，获取天气并规划活动

## 🛠️ 故障排除

### 常见错误

1. **LibSQL 错误**
   - 确保已移除所有 `LibSQLStore` 的引用
   - Cloudflare Workers 不支持文件系统存储

2. **环境变量未设置**
   - 确保设置了 `OPENAI_API_KEY` 和 `YOUTUBE_API_KEY`
   - 使用 `npx wrangler secret list` 查看已设置的密钥

3. **部署权限错误**
   - 确保已登录 Cloudflare：`npx wrangler login`
   - 检查账户权限

### 查看日志

```bash
# 查看实时日志
npx wrangler tail

# 查看特定部署的日志
npx wrangler tail --format=pretty
```

## 📦 项目结构

```
src/
├── worker.ts              # Cloudflare Worker 入口文件
├── mastra/
│   ├── index.ts           # Mastra 配置（已移除 LibSQL）
│   ├── agents/
│   │   ├── subtitle-agent.ts    # 字幕代理
│   │   └── weather-agent.ts     # 天气代理
│   └── tools/
│       ├── subtitle-agent-simple.ts
│       └── weather-tool.ts
wrangler.toml              # Cloudflare Workers 配置
```

## 🔐 安全注意事项

1. 永远不要在代码中硬编码 API 密钥
2. 使用 Wrangler Secrets 管理敏感信息
3. 定期轮换 API 密钥
4. 监控 API 使用情况

## 🎯 下一步

- 配置自定义域名
- 设置监控和告警
- 优化性能和成本
- 添加更多 Agent 和工具
