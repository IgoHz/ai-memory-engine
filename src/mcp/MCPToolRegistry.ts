import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { MemorySearchSchema } from './schemas/MemorySearchSchema.js';
import { BasicSearchSchema } from './schemas/BasicSearchSchema.js';
import { MemorySearchOptions } from '../search/types.js';
import type { MemorySearch } from '../search/MemorySearchService.js';
import { MemoryStoreSchema } from './schemas/MemoryStoreSchema.js';
import type { MemoryWriter, MemoryWriteInput } from '../writing/MemoryWriter.js';
import type { ProjectRegistry } from '../config/ProjectRegistry.js';
import type { IncrementalIndexer } from '../indexing/IncrementalIndexer.js';
import type { MemoryArchiver } from '../writing/MemoryArchiver.js';
import { MemoryArchiveSchema } from './schemas/MemoryArchiveSchema.js';
import { ProjectSummarySchema } from './schemas/ProjectSummarySchema.js';
import type { ProjectSummarizer } from '../writing/ProjectSummarizer.js';

export class MCPToolRegistry {
  constructor(
    private readonly memorySearch: MemorySearch,
    private readonly memoryWriter?: MemoryWriter,
    private readonly projectRegistry?: ProjectRegistry,
    private readonly indexer?: IncrementalIndexer,
    private readonly memoryArchiver?: MemoryArchiver,
    private readonly projectSummarizer?: ProjectSummarizer
  ) {}

  registerTools(server: McpServer): void {
    this.registerMemorySearchTool(server);

    this.registerAdrSearchTool(server);
    this.registerBugSearchTool(server);
    this.registerDecisionSearchTool(server);
    this.registerSnippetSearchTool(server);
    this.registerMemoryStoreTool(server);
    this.registerMemoryArchiveTool(server);
    this.registerProjectSummaryTool(server);
  }

  private registerProjectSummaryTool(server: McpServer): void {
    if (!this.projectSummarizer || !this.projectRegistry || !this.indexer) {
      return;
    }

    server.registerTool(
      'memory_summarize_project',
      {
        title: 'Summarize Project Memories',
        description: 'Generate and index a project memory summary',
        inputSchema: ProjectSummarySchema
      },
      async ({ project }: { project: string }) => {
        const registry = await this.projectRegistry!.loadProjects();
        await this.projectSummarizer!.writeSummary(registry, project);
        await this.indexer!.indexProject(registry, project);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Project summary generated: ${project}/project-summary.md`
            }
          ]
        };
      }
    );
  }

  private registerMemoryArchiveTool(server: McpServer): void {
    if (!this.memoryArchiver || !this.projectRegistry || !this.indexer) {
      return;
    }

    server.registerTool(
      'memory_archive_stale',
      {
        title: 'Archive Stale Memories',
        description: 'Archive old project memories and reindex the project',
        inputSchema: MemoryArchiveSchema
      },
      async ({ project, maxAgeDays }: { project: string; maxAgeDays: number }) => {
        const registry = await this.projectRegistry!.loadProjects();
        const result = await this.memoryArchiver!.archiveStale(
          registry,
          project,
          maxAgeDays
        );
        await this.indexer!.indexProject(registry, project);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Archived ${result.archivedFiles.length} memory file(s): ${result.archivedFiles.join(', ') || 'none'}`
            }
          ]
        };
      }
    );
  }

  private registerMemoryStoreTool(server: McpServer): void {
    if (!this.memoryWriter || !this.projectRegistry || !this.indexer) {
      return;
    }

    server.registerTool(
      'memory_store',
      {
        title: 'Store Memory',
        description: 'Write and index a project memory',
        inputSchema: MemoryStoreSchema
      },
      async (input: MemoryWriteInput) => {
        const registry = await this.projectRegistry!.loadProjects();
        await this.memoryWriter!.write(registry, input);
        await this.indexer!.indexProject(registry, input.project);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Memory stored and indexed: ${input.fileName}`
            }
          ]
        };
      }
    );
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
        return this.memorySearch.search.bind(this.memorySearch);
      case 'adr':
        return this.memorySearch.searchAdr.bind(this.memorySearch);
      case 'bug':
        return this.memorySearch.searchBug.bind(this.memorySearch);
      case 'decision':
        return this.memorySearch.searchDecision.bind(this.memorySearch);
      case 'snippet':
        return this.memorySearch.searchSnippet.bind(this.memorySearch);
      default:
        throw new Error(`Unknown search type: ${type}`);
    }
  }
}
