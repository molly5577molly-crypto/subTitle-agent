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
  return c.json({ 
    status: 'ok', 
    message: 'Subtitle Agent is running!',
    timestamp: new Date().toISOString()
  });
});

// Add agent endpoints
app.post('/api/agents/:agentName/generate', async (c) => {
  try {
    const agentName = c.req.param('agentName');
    const { messages } = await c.req.json();
    
    const agent = mastra.getAgent(agentName);
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
    
    const workflow = mastra.getWorkflow(workflowId);
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
