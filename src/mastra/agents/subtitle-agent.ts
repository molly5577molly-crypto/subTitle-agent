import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import { subtitleAgentInstance } from './agents/subtitle-agent';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent, subtitleAgent: subtitleAgentInstance },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
