# ai-memory-engine

The engine indexes project-local Markdown memories into LanceDB and exposes semantic search and `memory_store` through MCP. It supports separate project tables and project-relative memory paths while keeping filesystem source paths out of retrieval results.

## Development

```bash
npm install
npm run type-check
npm run lint
npm test -- --run
npm run build
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for dependency composition and [AUDIT.md](AUDIT.md) for the current roadmap status.

Configuration is loaded from `config/projects.yaml` and environment variables. `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, and `DB_PATH` control embeddings and storage.

Use `project: "*"` with a search tool for global retrieval across indexed projects.

Memories may include `importance` frontmatter from `0` to `1`; higher values receive a bounded ranking preference.

Set `archived: true` in frontmatter to hide a memory from normal searches. Use `includeArchived: true` when historical results are needed.

Use `maxAgeDays` to restrict results to recently updated memories without changing stored files.

Use the `memory_archive_stale` MCP tool with `project` and `maxAgeDays` to explicitly archive old Markdown memories and reindex the project.

Use `relatedTo` frontmatter and the matching search option to associate memories with decisions, bugs, or other project identifiers.

Highly overlapping retrieved results are conservatively deduplicated before formatting.

Use the `memory_summarize_project` MCP tool to generate a deterministic `project-summary.md` report.

Configuring MCP server in opencode:
1) Building the project:
```bash
npm run build
```

2) Making executable:
```bash
chmod +x dist/cli.js
```

3) Running the server:
```bash
npx ai-memory-engine
```

4) Adding MCP server to opencode config:
```json
{
  "mcp": {
    "memory-engine": {
      "type": "local",
      "command": ["npx", "-y", "ai-memory-engine"],
      "enabled": true
    }
  }
}
```
