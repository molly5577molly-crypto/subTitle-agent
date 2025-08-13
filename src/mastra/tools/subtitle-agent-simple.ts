import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { translate } from 'google-translate-api-x';

// YouTube API密钥（使用环境变量，避免硬编码）
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

export const subtitleAgentNormal = createTool({
  id: 'subtitle-agent-normal',
  description: 'Get real YouTube video information using YouTube Data API v3',
  inputSchema: z.object({
    youtubeUrl: z.string().describe('YouTube video URL or video ID'),
    targetLanguage: z.string().default('zh-cn').describe('Target language code'),
  }),
  outputSchema: z.object({
    videoId: z.string(),
    videoTitle: z.string(),
    videoDescription: z.string(),
    duration: z.string(),
    viewCount: z.string(),
    likeCount: z.string(),
    channelTitle: z.string(),
    publishedAt: z.string(),
    translatedTitle: z.string(),
    translatedDescription: z.string(),
    status: z.string(),
  }),
  execute: async ({ context }) => {
    if (!YOUTUBE_API_KEY) {
      throw new Error('Missing YOUTUBE_API_KEY. Please set it in your .env and restart: YOUTUBE_API_KEY=YOUR_KEY');
    }
    return await processYouTubeVideoWithAPI(context.youtubeUrl, context.targetLanguage);
  },
});

const processYouTubeVideoWithAPI = async (youtubeUrl: string, targetLanguage: string = 'zh-cn') => {
  try {
    // 提取视频ID
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL or video ID');
    }

    console.log(`Processing video ID: ${videoId} using YouTube Data API`);

    // 使用YouTube Data API获取视频信息
    const videoInfo = await getVideoInfoFromAPI(videoId);

    console.log(`Successfully got video: ${videoInfo.title}`);

    // 翻译标题和描述
    const translatedTitle = await translateText(videoInfo.title, targetLanguage);
    const translatedDescription = await translateText(
      videoInfo.description.substring(0, 500), 
      targetLanguage
    );

    return {
      videoId: videoInfo.id,
      videoTitle: videoInfo.title,
      videoDescription: videoInfo.description.substring(0, 500),
      duration: formatDuration(videoInfo.duration),
      viewCount: parseInt(videoInfo.viewCount).toLocaleString(),
      likeCount: parseInt(videoInfo.likeCount || '0').toLocaleString(),
      channelTitle: videoInfo.channelTitle,
      publishedAt: new Date(videoInfo.publishedAt).toLocaleDateString('zh-CN'),
      translatedTitle: translatedTitle,
      translatedDescription: translatedDescription,
      status: '正常模式 - 使用YouTube Data API v3',
    };
  } catch (error) {
    console.error('Error processing video with API:', error);
    throw new Error(`Failed to process video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const getVideoInfoFromAPI = async (videoId: string) => {
  try {
    // YouTube Data API v3 endpoint
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    
    console.log('Calling YouTube Data API...');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found or not accessible');
    }
    
    const video = data.items[0];
    
    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description || '',
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      viewCount: video.statistics.viewCount || '0',
      likeCount: video.statistics.likeCount || '0',
      duration: video.contentDetails.duration, // ISO 8601 duration format
    };
  } catch (error) {
    console.error('YouTube API call failed:', error);
    throw error;
  }
};

const extractVideoId = (url: string): string | null => {
  try {
    // 如果已经是视频ID，直接返回
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    // 从各种YouTube URL格式中提取视频ID
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
};

const formatDuration = (isoDuration: string): string => {
  try {
    // 解析ISO 8601持续时间格式 (PT15M33S)
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    
    if (!match) {
      return '未知时长';
    }
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting duration:', error);
    return '未知时长';
  }
};

const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    if (!text || text.trim().length === 0) {
      return '';
    }

    console.log(`Translating text to ${targetLanguage}...`);

    const result = await translate(text, {
      from: 'auto', // 自动检测源语言
      to: targetLanguage,
      forceTo: true
    });

    return result.text;
  } catch (error) {
    console.error('Translation error:', error);
    return `[翻译失败] ${text}`;
  }
};

// 为了兼容性，添加别名导出
export { subtitleAgentNormal as subtitleAgentSimple };
