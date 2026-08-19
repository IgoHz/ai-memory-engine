# ai-memory-engine

`ai-memory-engine` is a local, project-aware memory system for Markdown files. It turns durable engineering notes into searchable vector records in LanceDB and exposes the resulting workflows through the Model Context Protocol (MCP). The design favors inspectable files, deterministic indexing, and explicit mutations over a hidden remote memory service.

## What It Solves

The source of truth is a directory of Markdown memories in each configured project. The engine adds semantic retrieval without moving that source of truth into a database:

1. Markdown files are parsed and their frontmatter is normalized.
2. Changed files are split into overlapping text chunks.
3. An Ollama embedding model converts each chunk into a vector.
4. Vectors and project-relative metadata are stored in a separate LanceDB table for each project.
5. A query is embedded once, searched against one project or all project tables, filtered, merged, ranked, deduplicated, and formatted as Markdown context.

The index is disposable derived state. `config/projects.yaml` and the Markdown files remain the authoritative inputs.

## Concepts And Class Relationships

The domain contracts in `src/domains/` describe the data moving through the system:

| Entity | Meaning | Connected implementation |
| --- | --- | --- |
| `ProjectConfig` / `ProjectsRegistry` | A project name and its memory directory | `ProjectRegistry` loads and resolves `config/projects.yaml` |
| `MemoryFile` | A parsed Markdown file with frontmatter and paths | Parsers discover files and preserve the source location |
| `MemoryDocument` | A normalized file ready for indexing; includes content, metadata, hash, and modification time | `createMemoryDocuments` creates documents from parsed files |
| `MemoryMetadata` | Searchable identity and policy fields: project, type, title, tags, importance, archive state, relations, and relative path | Shared by documents, chunks, and retrieval results |
| `MemoryChunk` | A document fragment with a stable `filePath#chunk-index` id | `MemoryChunker` creates chunks before embedding |
| `RetrievedChunk` | A stored chunk plus its vector distance | `VectorRetriever` filters and ranks it for a query |
| `IndexState` | SHA-256 hashes of indexed absolute source files | `IndexStateRepository` enables incremental indexing |

The production object graph is assembled in `src/app/compositionRoot.ts`:

```text
MCPServer
  -> MCPToolRegistry
      -> MemorySearch -> VectorRetriever -> MemoryChunkRepository
      -> MemoryWriter / MemoryArchiver / ProjectSummarizer
      -> MemoryRelationshipService / MemoryDuplicateService

IncrementalIndexer
  -> ProjectRegistry -> Markdown parsers/normalizers -> MemoryChunker
  -> EmbeddingsProvider -> MemoryChunkRepository -> LanceDB
  -> IndexStateRepository -> db/indexState.json
```

The dependency direction is interface adapters (`mcp/`, CLI) -> application services (`indexing/`, `search/`, `writing/`) -> domain contracts (`domains/`). Infrastructure adapters (`repositories/`, `embeddings/`) are injected at the composition root. This keeps MCP handlers thin and makes tests use `TestEmbeddingsProvider` instead of requiring Ollama.

For a shorter dependency overview, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Indexing Algorithm

`IncrementalIndexer` applies this algorithm for one project or for every project:

1. Load the project registry and the previous `IndexState`.
2. Discover Markdown files and parse frontmatter into `MemoryFile` values.
3. Normalize each file into a `MemoryDocument`. The absolute `sourcePath` is used only for reading and state tracking; `metadata.filePath` is project-relative and safe to return to callers.
4. Compare each document's SHA-256 content hash with the saved state.
5. Remove chunks for files that no longer exist.
6. Split changed documents with a 1,000-character chunk size and 200-character overlap. Empty, heading-only, very short, and duplicate chunks are discarded.
7. Generate embeddings and atomically replace the changed document's chunks in its project table.
8. Save the new file hashes and timestamps.

Unchanged files do not call the embedding provider. This makes repeated indexing proportional to the changed portion of a project rather than its total memory collection.

## Retrieval Algorithm

`MemorySearch` selects the search mode (`memory`, `adr`, `bug`, `decision`, or `snippet`) and delegates to `VectorRetriever`. The retriever:

1. Requires a project name or `"*"`. A wildcard embeds the query once and searches every existing project table.
2. Applies vector distance filtering, with a default maximum distance of `0.35`.
3. Applies metadata filters for type, tags, path, archive state, age, and `relatedTo` identifiers.
4. Merges chunks from the same project-relative file, retaining the best distance and combined metadata.
5. Ranks by vector distance with a bounded importance bonus: `rank = distance - importance * 0.1`.
6. Removes highly overlapping text and returns the requested result limit, formatted as Markdown.

Archived memories are excluded by default. `includeArchived` opts into historical retrieval; `maxAgeDays` is read-only and does not archive files.

## Memory File Format

Any Markdown file under a configured `memoryDir` can be indexed. Frontmatter is optional; unknown or invalid optional values fall back to safe defaults.

```markdown
---
type: adr
title: Use an event log for synchronization
tags:
  - architecture
  - sync
importance: 0.8
relatedTo:
  - bug-142
archived: false
---

The decision and its context go here.
```

`importance` is normalized to `0..1`. `archived: true` hides the file from normal search. `relatedTo` provides lightweight, portable links between memories; it is intentionally not a graph database.

## MCP Tools

The npm executable starts an MCP server over stdio. It registers:

| Tool | Purpose |
| --- | --- |
| `memory_search` | Search all memory types |
| `adr_search`, `bug_search`, `decision_search`, `snippet_search` | Search a specific memory type |
| `memory_store` | Write a Markdown memory and index it |
| `memory_archive_stale` | Archive old files and reindex the project |
| `memory_related` | Retrieve memories by `relatedTo` identifier |
| `memory_find_duplicates` | Report cross-file embedding similarity candidates without changing files |
| `memory_summarize_project` | Write and index a deterministic `project-summary.md` |

Search requests use a `project` field. Use `project: "*"` for global retrieval. The MCP schemas in `src/mcp/schemas/` are the executable reference for all optional fields and limits.

## Installation And Usage

### Prerequisites

- Node.js 20 or newer
- Ollama running locally or at a reachable URL
- An installed embedding model, for example:

```bash
ollama pull nomic-embed-text
```

### Install from npm

```bash
npm install -g ai-memory-engine
```

Or run it without a global install:

```bash
npx -y ai-memory-engine
```

The package exposes the `ai-memory-engine` executable. It starts the MCP server and waits for an MCP client on stdin/stdout.

### Configure projects

Create `config/projects.yaml` in the working directory:

```yaml
projects:
  my-project:
    memoryDir: memory
  another-project:
    memoryDir: notes
```

The default database location is `./db`. Set these environment variables to override defaults:

| Variable | Default | Purpose |
| --- | --- | --- |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama endpoint |
| `OLLAMA_MODEL` | `nomic-embed-text` | Embedding model name |
| `DB_PATH` | `./db` | LanceDB and index-state directory |

### Run manually

The published CLI starts the MCP server:

```bash
npx ai-memory-engine
```

Indexing is available from the repository scripts during development (`npm run index` and `npm run index:watch`). The MCP `memory_store`, `memory_archive_stale`, and `memory_summarize_project` tools also reindex the affected project as part of their workflows.

### Configure an MCP client

For an opencode-style configuration:

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

Set `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, and `DB_PATH` in the environment inherited by the MCP client. The process working directory is significant because project configuration and the default database path are resolved from it.

## Development

```bash
npm install
npm run type-check
npm run lint
npm test -- --run
npm run build
```

Useful commands are `npm run index` for a one-time index, `npm run index:watch` for filesystem watching, and `npm run test:integration` for integration coverage. The test suite can use deterministic test embeddings and does not require a running Ollama service.

## License

This project is licensed under the [MIT License](LICENSE).
