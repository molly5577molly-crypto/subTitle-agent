# YouTube字幕提取和翻译Agent

这个Agent可以从YouTube视频中提取字幕并翻译成中文，支持两种模式：

## 功能特性

1. **现有字幕提取**：从有字幕的YouTube视频中直接获取字幕
2. **音频转录**：对于没有字幕的视频，自动下载音频并使用OpenAI Whisper进行语音转文字
3. **智能翻译**：使用Google翻译API将内容翻译成中文
4. **自动降级**：优先使用现有字幕，无字幕时自动切换到音频转录

## 环境配置

在使用音频转录功能前，需要设置以下环境变量：

```bash
# 在.env文件中添加
OPENAI_API_KEY=your_openai_api_key_here
```

## 使用方法

### 基本用法（优先使用现有字幕）
```typescript
import { mastra } from './src/mastra/index';

const result = await mastra.agents.subtitleAgent.generate([
  {
    role: 'user',
    content: JSON.stringify({
      youtubeUrl: 'https://www.youtube.com/watch?v=VIDEO_ID',
      targetLanguage: 'zh'
    })
  }
]);
```

### 强制使用音频转录
```typescript
const result = await mastra.agents.subtitleAgent.generate([
  {
    role: 'user',
    content: JSON.stringify({
      youtubeUrl: 'https://www.youtube.com/watch?v=VIDEO_ID',
      targetLanguage: 'zh',
      useAudioTranscription: true
    })
  }
]);
```

### 支持的URL格式
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- 直接使用视频ID：`VIDEO_ID`

## 输出格式

```json
{
  "videoId": "VIDEO_ID",
  "videoTitle": "视频标题",
  "originalLanguage": "en",
  "targetLanguage": "zh",
  "method": "existing_subtitles" | "audio_transcription",
  "subtitles": [
    {
      "start": "00:00:05.000",
      "duration": "5",
      "originalText": "Hello world",
      "translatedText": "你好世界"
    }
  ],
  "totalSegments": 100
}
```

## 注意事项

1. **API费用**：音频转录会消耗OpenAI API配额
2. **处理时间**：音频转录比字幕提取需要更长时间
3. **文件大小**：长视频的音频文件可能较大，影响处理速度
4. **临时文件**：音频文件会在处理完成后自动清理

## 错误处理

- 无效的YouTube URL会返回错误
- 网络连接问题会自动重试
- API密钥缺失时会给出明确提示
- 音频下载失败时会回退到字幕提取模式

## 性能优化建议

1. 对于有字幕的视频，避免使用`useAudioTranscription: true`
2. 批量处理时考虑添加延迟以避免API限制
3. 监控OpenAI API使用量以控制成本
