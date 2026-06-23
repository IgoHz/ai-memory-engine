import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { MemorySearchSchema } from './schemas/MemorySearchSchema.js';
import { BasicSearchSchema } from './schemas/BasicSearchSchema.js';
import { MemorySearchOptions } from '../search/types.js';
import { memorySearch } from '../search/MemorySearchService.js';

class MCPToolRegistry {
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
        inputSchema: MemorySearchSchema
      },
      async (options: MemorySearchOptions) =>
        this.searchHandler('memory', options)
    );
  }

  private registerAdrSearchTool(server: McpServer): void {
    server.registerTool(
      'adr_search',
      {
        title: 'ADR Search',
        description: 'Search ADR memories',
        inputSchema: BasicSearchSchema
      },
      async (options: MemorySearchOptions) => this.searchHandler('adr', options)
    );
  }

  private registerBugSearchTool(server: McpServer): void {
    server.registerTool(
      'bug_search',
      {
        title: 'Bug Search',
        description: 'Search bug memories',
        inputSchema: BasicSearchSchema
      },
      async (options: MemorySearchOptions) => this.searchHandler('bug', options)
    );
  }

  private registerDecisionSearchTool(server: McpServer): void {
    server.registerTool(
      'decision_search',
      {
        title: 'Decision Search',
        description: 'Search decision memories',
        inputSchema: BasicSearchSchema
      },
      async (options: MemorySearchOptions) =>
        this.searchHandler('decision', options)
    );
  }

  private registerSnippetSearchTool(server: McpServer): void {
    server.registerTool(
      'snippet_search',
      {
        title: 'Snippet Search',
        description: 'Search code snippets',
        inputSchema: BasicSearchSchema
      },
      async (options: MemorySearchOptions) =>
        this.searchHandler('snippet', options)
    );
  }

  private async searchHandler(type: string, options: MemorySearchOptions) {
    const searchFunction = this.getSearchFunction(type);
    const result = await searchFunction(options);

    return {
      content: [
        {
          type: 'text' as const,
          text: result.content
        }
      ]
    };
  }

  private getSearchFunction(type: string) {
    switch (type) {
      case 'memory':
        return memorySearch.search.bind(memorySearch);
      case 'adr':
        return memorySearch.searchAdr.bind(memorySearch);
      case 'bug':
        return memorySearch.searchBug.bind(memorySearch);
      case 'decision':
        return memorySearch.searchDecision.bind(memorySearch);
      case 'snippet':
        return memorySearch.searchSnippet.bind(memorySearch);
      default:
        throw new Error(`Unknown search type: ${type}`);
    }
  }
}

export const mcpToolRegistry = new MCPToolRegistry();
