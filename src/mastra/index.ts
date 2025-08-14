
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import { subtitleAgentInstance } from './agents/subtitle-agent';
import { CloudflareDeployer } from "@mastra/deployer-cloudflare";

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent, subtitleAgent: subtitleAgentInstance },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  deployer: new CloudflareDeployer({
    projectName: "subtitle-agent",
    env: {
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
      CLOUDFLARE_API_EMAIL: process.env.CLOUDFLARE_API_EMAIL,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    }
  })
});


