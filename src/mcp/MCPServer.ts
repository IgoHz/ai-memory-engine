import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { mcpToolRegistry } from './MCPToolRegistry';

class MCPServer {
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

    mcpToolRegistry.registerTools(this.server);
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

export const mcpServer = new MCPServer();
