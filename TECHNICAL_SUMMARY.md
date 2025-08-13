## YouTube 字幕与翻译 Agent 技术流程总结

### 概览
- 框架：Mastra
- 核心文件：`src/mastra/tools/subtitle-agent-simple.ts`（正常版）、`src/mastra/agents/subtitle-agent.ts`
- 当前生效方案：使用 YouTube Data API v3 获取视频信息 + 翻译标题/描述

### 关键流程
1) 解析视频 ID
- 支持多种 URL 形态（watch、youtu.be、embed）
- 正则提取 11 位视频 ID

2) 调用官方 API 获取视频信息（稳定可靠）
- Endpoint: `https://www.googleapis.com/youtube/v3/videos`
- parts: `snippet,statistics,contentDetails`
- 需提供 `YOUTUBE_API_KEY`（环境变量）

3) 数据加工
- 时长：解析 ISO8601（PTxHxMxS）为 `HH:MM:SS` 或 `MM:SS`
- 数字：`toLocaleString()` 美化显示

4) 文本翻译
- 使用 `google-translate-api-x`
- 自动检测源语言，强制按目标语言输出（默认 `zh-cn`）

### 安全与配置
- 不再在代码中硬编码 API Key；通过环境变量 `YOUTUBE_API_KEY` 注入
- OpenAI/FFmpeg/ytdl 相关依赖已移除，避免不必要风险与体积

### 目录与组件
- `src/mastra/agents/subtitle-agent.ts`
  - 引用正常版工具：`subtitleAgentNormal`
  - LLM: `gpt-4o-mini`
- `src/mastra/tools/subtitle-agent-simple.ts`
  - 实现 `subtitleAgentNormal`
  - 核心：提取 ID -> 调用 YouTube API -> 翻译

### 已清理/弃用
- `src/mastra/tools/subtitle-agent.ts`：旧版（ytdl/ffmpeg/whisper）已禁用，仅保留空实现防误用
- `package.json`：移除 `@distube/ytdl-core`、`@ffmpeg-installer/ffmpeg`、`fluent-ffmpeg`、`openai`

### 运行说明
1. 设置环境变量
```
YOUTUBE_API_KEY=你的YouTube密钥
```
2. 启动
```
npm run dev
```
3. 在 Playground 使用 Agent：`subtitleAgent`
输入：
```
{
  "youtubeUrl": "https://youtu.be/<VIDEO_ID>",
  "targetLanguage": "zh-cn"
}
```

### 后续可选扩展
- 加入字幕轨抓取（需登录/签名支持）
- 集成音频转写（Whisper）并按时间轴切片
- 增加结果缓存（降低 API 调用与配额消耗）


