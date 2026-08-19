# Roadmap Audit

Status is based on the current implementation, not the historical milestone labels.

| Milestones | Status | Evidence / gap |
| --- | --- | --- |
| 1-6 | Mostly complete | TypeScript project, domain contracts, YAML registry, Zod validation, formatting, and ESLint validation exist. |
| 7-12 | Mostly complete | Markdown discovery, loading, gray-matter parsing, normalization and document creation exist. Metadata is intentionally small and `updatedAt` is document-level. |
| 13-16 | Mostly complete | Recursive splitter, deterministic relative-path chunk IDs, metadata preservation and document-to-chunk flow exist. Chunk filtering is implemented but not independently tested. |
| 17-20 | Partially complete | Ollama adapter and batch API exist. Retry policy and explicit failure/transaction handling are missing. |
| 21-25 | Mostly complete | LanceDB connection, per-project tables, insert and document replacement exist. Repository is still backed by process-wide database state. |
| 26-30 | Mostly complete | Full and hash-based incremental indexing exist, including deleted-file cleanup. Watchers now own handles, avoid duplicate starts, and close on process shutdown. |
| 31-35 | Mostly complete | Vector retrieval, project isolation, metadata filters, distance threshold and file-level merge exist. Global search is not supported and filtering occurs after a fixed 100-row vector query. |
| 36-38 | Partially complete | Markdown context formatting exists; a separate formatter abstraction and compact formatter are missing. |
| 39-43 | Mostly complete | One `MemorySearch` service exposes all five type-specific operations without duplicated retrieval logic. |
| 44-47 | Mostly complete | MCP server, five search tools, `memory_store`, Zod input schemas and adapter handlers exist. Tool handlers receive injected application services. |
| 48-50 | Mostly complete | CLI, environment configuration, ESLint, and production TypeScript build exist. Startup lifecycle remains intentionally minimal for the stdio MCP process. |
| 51-54 | Partially complete | MCP registration and tool-level Planner/Builder/Reviewer search coverage exist in the repository, but external OpenCode config verification is not automated. |
| 55-57 | Mostly complete | `MemoryWriter` persists validated Markdown, `memory_store` exposes it through MCP, and the affected project is explicitly reindexed before the tool returns. |
| 58 | Mostly complete | `project: "*"` searches all existing project tables, embeds once, preserves project identity, and deduplicates by project plus path. |
| 59 | Mostly complete | `relatedTo` identifiers are normalized, persisted, searchable, preserved across merged chunks, and available through `memory_related` reverse lookup. A dedicated relationship index/graph is still missing. |
| 60-61 | Missing | Bug history and snippet-library relationship workflows remain unimplemented. |
| 62 | Mostly complete | Retrieval applies conservative lexical near-duplicate removal, and `memory_find_duplicates` reports cross-file embedding similarity from stored vectors. Automatic destructive merging remains intentionally unimplemented. |
| 63 | Mostly complete | `ProjectSummarizer` generates `project-summary.md` from current memory metadata and is exposed through MCP with post-write indexing. |
| 64 | Mostly complete | Optional frontmatter importance is normalized to `[0, 1]` and applies a bounded retrieval ranking adjustment. |
| 65 | Complete | `archived` frontmatter is persisted and excluded from searches by default; `maxAgeDays` freshness filtering and explicit `memory_archive_stale` archival are supported. Archived projects are reindexed after mutation. |
| 66 | Missing | Namespace isolation remains unimplemented. |
| 67-70 | Future / missing | Hybrid retrieval, reranking, knowledge graph, and multi-agent features are not implemented and are not required for the current foundation. |

## Repairs made in this audit

- Separated absolute source paths from project-relative retrieval paths.
- Made search and MCP construction explicit and injectable.
- Made index state and vector persistence collaborators of `IncrementalIndexer`.
- Removed stale index state and vectors when markdown files disappear.
- Added architecture documentation and a test composition using fake embeddings.
- Added the first memory-writing slice with frontmatter serialization and path-safety tests.

## Next implementation slice

Implement milestone 55 with a small writer port and application service, then add focused writer tests before wiring watcher-triggered indexing. Avoid introducing global search or a knowledge graph until the write lifecycle and repository ownership are stable.
