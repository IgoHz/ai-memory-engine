import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { z } from 'zod';
import { memorySearchService } from '../services';

class MCPToolService {
  registerTools(server: McpServer): void {
    this.registerMemorySearchTool(server);

    this.registerAdrSearchTool(server);
    this.registerBugSearchTool(server);
    this.registerDecisionSearchTool(server);
    this.registerSnippetSearchTool(server);
  }

  private registerMemorySearchTool(server: McpServer): void {
    server.registerTool(
      'memory_search',
      {
        title: 'Memory Search',
        description: 'Search project memories',
        inputSchema: {
          query: z.string(),
          project: z.string(),
          limit: z.number().optional(),
          minScore: z.number().optional(),
          tags: z.array(z.string()).optional()
        }
      },
      async ({ query, project, limit, minScore, tags }) => {
        return {
          content: [
            {
              type: 'text',
              text: (
                await memorySearchService.search({
                  query,
                  project,
                  limit,
                  minScore,
                  tags
                })
              ).content
            }
          ]
        };
      }
    );
  }

  private registerAdrSearchTool(server: McpServer): void {
    server.registerTool(
      'adr_search',
      {
        title: 'ADR Search',
        description: 'Search ADR memories',
        inputSchema: {
          query: z.string(),
          project: z.string()
        }
      },
      async ({ query, project }) => {
        return {
          content: [
            {
              type: 'text',
              text: (
                await memorySearchService.searchAdr({
                  query,
                  project
                })
              ).content
            }
          ]
        };
      }
    );
  }

  private registerBugSearchTool(server: McpServer): void {
    server.registerTool(
      'bug_search',
      {
        title: 'Bug Search',
        description: 'Search bug memories',
        inputSchema: {
          query: z.string(),
          project: z.string()
        }
      },
      async ({ query, project }) => {
        return {
          content: [
            {
              type: 'text',
              text: (
                await memorySearchService.searchBug({
                  query,
                  project
                })
              ).content
            }
          ]
        };
      }
    );
  }

  private registerDecisionSearchTool(server: McpServer): void {
    server.registerTool(
      'decision_search',
      {
        title: 'Decision Search',
        description: 'Search decision memories',
        inputSchema: {
          query: z.string(),
          project: z.string()
        }
      },
      async ({ query, project }) => {
        return {
          content: [
            {
              type: 'text',
              text: (
                await memorySearchService.searchDecision({
                  query,
                  project
                })
              ).content
            }
          ]
        };
      }
    );
  }

  private registerSnippetSearchTool(server: McpServer): void {
    server.registerTool(
      'snippet_search',
      {
        title: 'Snippet Search',
        description: 'Search code snippets',
        inputSchema: {
          query: z.string(),
          project: z.string()
        }
      },
      async ({ query, project }) => {
        return {
          content: [
            {
              type: 'text',
              text: (
                await memorySearchService.searchSnippet({
                  query,
                  project
                })
              ).content
            }
          ]
        };
      }
    );
  }
}

export const mcpToolService = new MCPToolService();
