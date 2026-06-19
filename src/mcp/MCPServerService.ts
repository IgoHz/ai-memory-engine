import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { mcpToolService } from './MCPToolService';

class MCPServerService {
  private readonly server: McpServer;

  constructor() {
    this.server = new McpServer(
      {
        name: 'ai-memory-engine',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    mcpToolService.registerTools(this.server);
  }

  getServer(): McpServer {
    return this.server;
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();

    await this.server.connect(transport);

    console.error('AI Memory Engine MCP server started');
  }
}

export const mcpServerService = new MCPServerService();
