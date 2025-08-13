// Cloudflare Worker entry point for Mastra application
import { Hono } from 'hono';
import { mastra } from './mastra/index';
import { cors } from 'hono/cors';

// Create a new Hono app
const app = new Hono();

// Add CORS middleware
app.use('*', cors());

// Health check endpoint
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>字幕代理 - Subtitle Agent</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          max-width: 800px; 
          margin: 0 auto; 
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: white;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        h1 { 
          color: #fff; 
          text-align: center; 
          margin-bottom: 2rem;
          font-size: 2.5rem;
        }
        .status {
          background: rgba(76, 175, 80, 0.2);
          border: 1px solid rgba(76, 175, 80, 0.5);
          padding: 1rem;
          border-radius: 10px;
          margin: 1rem 0;
          text-align: center;
        }
        .api-section {
          margin: 2rem 0;
        }
        .api-section h3 {
          color: #fff;
          border-bottom: 2px solid rgba(255, 255, 255, 0.3);
          padding-bottom: 0.5rem;
        }
        .endpoint {
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          margin: 0.5rem 0;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
        }
        .method {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-weight: bold;
          margin-right: 0.5rem;
        }
        .get { background: #4CAF50; }
        .post { background: #2196F3; }
        .description {
          font-size: 0.9rem;
          margin-top: 0.5rem;
          opacity: 0.8;
        }
        .example {
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }
        a { color: #81C784; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎬 字幕代理服务</h1>
        
        <div class="status">
          ✅ 服务运行正常 | 时间: ${new Date().toLocaleString('zh-CN')}
        </div>

        <div class="api-section">
          <h3>📡 可用的 API 端点</h3>
          
          <div class="endpoint">
            <span class="method get">GET</span>/api/agents
            <div class="description">获取所有可用的 AI 代理列表</div>
          </div>
          
          <div class="endpoint">
            <span class="method get">GET</span>/api/workflows  
            <div class="description">获取所有可用的工作流列表</div>
          </div>
          
          <div class="endpoint">
            <span class="method post">POST</span>/api/agents/subtitleAgent/generate
            <div class="description">调用字幕代理处理 YouTube 视频</div>
          </div>
          
          <div class="endpoint">
            <span class="method post">POST</span>/api/agents/weatherAgent/generate
            <div class="description">调用天气代理获取天气信息</div>
          </div>
          
          <div class="endpoint">
            <span class="method post">POST</span>/api/workflows/weatherWorkflow/run
            <div class="description">执行天气工作流</div>
          </div>
        </div>

        <div class="api-section">
          <h3>💡 使用示例</h3>
          
          <h4>字幕代理示例：</h4>
          <div class="example">
POST /api/agents/subtitleAgent/generate
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "请处理这个YouTube视频: https://youtube.com/watch?v=VIDEO_ID"
    }
  ]
}
          </div>
          
          <h4>天气代理示例：</h4>
          <div class="example">
POST /api/agents/weatherAgent/generate  
Content-Type: application/json

{
  "messages": [
    {
      "role": "user", 
      "content": "北京今天天气怎么样？"
    }
  ]
}
          </div>
        </div>

        <div class="api-section">
          <h3>🔗 快速链接</h3>
          <p>
            <a href="/api/agents" target="_blank">查看可用代理</a> | 
            <a href="/api/workflows" target="_blank">查看可用工作流</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Add agent endpoints
app.post('/api/agents/:agentName/generate', async (c) => {
  try {
    const agentName = c.req.param('agentName');
    const { messages } = await c.req.json();
    
    const agent = mastra.getAgent(agentName as 'weatherAgent' | 'subtitleAgent');
    if (!agent) {
      return c.json({ error: `Agent '${agentName}' not found` }, 404);
    }
    
    const result = await agent.generate(messages);
    return c.json(result);
  } catch (error) {
    console.error('Error in agent generation:', error);
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Add workflow endpoints
app.post('/api/workflows/:workflowId/run', async (c) => {
  try {
    const workflowId = c.req.param('workflowId');
    const input = await c.req.json();
    
    const workflow = mastra.getWorkflow(workflowId as 'weatherWorkflow');
    if (!workflow) {
      return c.json({ error: `Workflow '${workflowId}' not found` }, 404);
    }
    
    const result = await workflow.execute(input);
    return c.json(result);
  } catch (error) {
    console.error('Error in workflow execution:', error);
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// List available agents
app.get('/api/agents', (c) => {
  const agents = mastra.getAgents();
  return c.json(Object.keys(agents));
});

// List available workflows
app.get('/api/workflows', (c) => {
  const workflows = mastra.getWorkflows();
  return c.json(Object.keys(workflows));
});

// Export the default fetch handler for Cloudflare Workers
export default {
  fetch: app.fetch.bind(app),
};

// Export for compatibility
export { app };
