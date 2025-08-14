# Cloudflare Workers 部署指南

这个指南将帮助您将 Mastra 字幕代理应用部署到 Cloudflare Workers。

## 前置条件

1. **Cloudflare 账户**: 确保您有一个 Cloudflare 账户
2. **Node.js**: 版本 >= 20.9.0
3. **npm**: 用于安装依赖项

## 步骤 1: 安装依赖项

```bash
npm install
```

## 步骤 2: 获取 Cloudflare 凭据

### 获取账户 ID
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 在右侧边栏找到您的 **账户 ID**

### 获取 API Token
1. 前往 [API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **创建令牌**
3. 选择 **Cloudflare Workers:Edit** 模板
4. 配置权限：
   - **Account** - Cloudflare Workers:Edit - [您的账户]
   - **Zone** - Zone:Read - All zones (如果需要自定义域名)
5. 点击 **继续以显示摘要**，然后 **创建令牌**
6. 复制生成的 API Token

## 步骤 3: 配置环境变量

### 方式 1: 使用 Wrangler Secrets (推荐)

首先登录 Wrangler:

```bash
npm run wrangler:login
```

然后设置所有必需的密钥:

```bash
# Cloudflare 凭据
wrangler secret put CLOUDFLARE_ACCOUNT_ID
wrangler secret put CLOUDFLARE_API_TOKEN  
wrangler secret put CLOUDFLARE_API_EMAIL

# API 密钥
wrangler secret put OPENAI_API_KEY
wrangler secret put YOUTUBE_API_KEY
```

### 方式 2: 使用本地环境文件 (仅用于开发)

创建 `.env.local` 文件:

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_API_EMAIL=your_email@example.com
OPENAI_API_KEY=your_openai_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

## 步骤 4: 构建和部署

### 部署到生产环境

```bash
npm run deploy
```

### 部署到预览环境

```bash
npm run deploy:preview
```

### 本地开发和测试

```bash
# 本地开发服务器
npm run dev

# 或使用 Wrangler 本地开发
npm run wrangler:dev
```

## 步骤 5: 验证部署

部署成功后，您将看到类似以下的输出:

```
✅ 部署成功！

🌍 你的应用现在已上线:
https://subtitle-agent.your-subdomain.workers.dev
```

访问提供的 URL 来验证您的应用是否正在运行。

## 可用的 API 端点

部署后，您的应用将提供以下端点:

- `GET /` - 服务状态页面
- `GET /api/agents` - 获取可用代理列表  
- `GET /api/workflows` - 获取可用工作流列表
- `POST /api/agents/subtitleAgent/generate` - 字幕代理
- `POST /api/agents/weatherAgent/generate` - 天气代理
- `POST /api/workflows/weatherWorkflow/run` - 天气工作流

## 故障排除

### 常见问题

1. **构建失败**: 确保所有依赖项都已正确安装
2. **部署失败**: 检查您的 Cloudflare 凭据是否正确
3. **API 错误**: 确保所有必需的 API 密钥都已设置

### 有用的命令

```bash
# 查看部署状态
wrangler deployments list

# 查看实时日志
wrangler tail

# 查看 Worker 详情
wrangler info

# 查看已设置的密钥
wrangler secret list
```

## 自定义域名 (可选)

要使用自定义域名:

1. 在 Cloudflare 中添加您的域名
2. 在 `src/mastra/index.ts` 的 CloudflareDeployer 配置中添加 routes:

```typescript
routes: [
  {
    pattern: "yourdomain.com/*",
    zone_name: "yourdomain.com",
    custom_domain: true,
  },
],
```

## 更多信息

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Mastra 部署文档](https://docs.mastra.ai/deployment/serverless-platforms/cloudflare-deployer)
