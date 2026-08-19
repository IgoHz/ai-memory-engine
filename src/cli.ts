#!/usr/bin/env node

import 'dotenv/config';

import { createMcpServer } from './mcp/index.js';
import { logger } from './utils/index.js';
import { env } from './config/env.js';

async function bootstrap() {
  logger.info('Configuration loaded', env);

  try {
    const mcpServer = createMcpServer();
    await mcpServer.start();
  } catch (error) {
    logger.error('Failed to start MCP server', error);
    process.exit(1);
  }
}

bootstrap();
