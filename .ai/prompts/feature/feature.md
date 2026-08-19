# Resume, Audit, Refactor and Continue `ai-memory-engine`

I've been developing a standalone `ai-memory-engine` for use across my projects. It is intended to provide persistent semantic memory to AI development workflows, especially OpenCode Planner / Builder / Reviewer agents.

The project has already been partially implemented up to approximately **milestone 53**, but I haven't worked on it for a while. The current implementation may therefore contain incomplete work, architectural inconsistencies, outdated assumptions, or partially implemented milestones.

Your task is to **take over the existing repository, understand its current state, fix what is necessary, improve the architecture, and continue implementation from the actual current state**.

Do not assume that milestones 1–53 are correctly or completely implemented just because they are listed below.

---

# Primary objectives

Work through the repository systematically and:

1. Audit the existing implementation against the roadmap.
2. Identify incomplete, incorrect, duplicated, or obsolete implementations.
3. Fix functional and architectural issues.
4. Improve the overall architecture before adding substantial new functionality.
5. Migrate away from inappropriate singleton-based architecture toward a **composition root / dependency injection approach**.
6. Strengthen domain boundaries and relationships between components.
7. Decide whether a stricter architecture such as **FSD or a domain-oriented variation of FSD** is appropriate for this project.
8. Refactor the existing code where necessary rather than layering new code on top of architectural problems.
9. Continue implementation from the actual completed milestone.
10. Implement and validate the remaining roadmap incrementally.
11. Keep the project generic and reusable across multiple repositories/projects.
12. Avoid unnecessary overengineering where it does not provide practical value.

The final result should be a maintainable standalone infrastructure project, not a prototype tightly coupled to one repository.

---

# Existing roadmap

## Phase 1 — Project Foundation

### 1. Create repository

```text
ai-memory-engine/
```

### 2. Configure TypeScript

Setup:

* tsconfig
* eslint
* prettier

### 3. Setup package structure

```text
src/
config/
db/
tests/
```

### 4. Define domain types

Create appropriate domain types such as:

```ts
MemoryDocument
MemoryChunk
MemoryMetadata
SearchOptions
SearchResult
```

Do not blindly preserve these names if the current domain model suggests better names or relationships.

### 5. Create project registry schema

Example:

```yaml
projects:
  client-a:
    root: /repos/client-a

  client-b:
    root: /repos/client-b
```

### 6. Implement registry loader

Responsible for loading and validating project configuration.

---

# Phase 2 — Markdown Memory Ingestion

### 7. Discover markdown files

```text
memory/**/*.md
```

### 8. Load file contents

### 9. Parse frontmatter

Using:

```ts
gray-matter
```

### 10. Normalize metadata

For example:

```yaml
tags:
  - auth
  - jwt
```

should become a normalized domain representation.

### 11. Create metadata schema

Expected concepts include:

```ts
project
type
tags
path
title
updatedAt
```

Extend this where necessary.

### 12. Build document objects

Convert source files into domain-level memory documents.

---

# Phase 3 — Chunking

### 13. Add LangChain splitter

Use an appropriate LangChain text splitter such as:

```ts
RecursiveCharacterTextSplitter
```

### 14. Create stable chunk IDs

For example:

```text
auth.md#chunk-3
```

IDs should remain stable where possible when unrelated chunks/files change.

### 15. Preserve metadata on chunks

Chunks must retain the metadata required for retrieval and filtering.

### 16. Build the document → chunk pipeline

```text
Markdown
↓
MemoryDocument
↓
MemoryChunk[]
```

---

# Phase 4 — Embeddings

### 17. Configure Ollama connection

The embedding model is hosted on a remote Ollama node.

### 18. Create embedding service

Use the appropriate LangChain Ollama integration.

The embedding implementation must be isolated behind an application/domain-facing interface so the rest of the system is not tightly coupled to Ollama.

### 19. Batch embedding generation

Avoid unnecessary one-request-per-chunk processing.

### 20. Handle retries and failures

Provide sensible network failure handling and avoid corrupting the index when embedding generation fails.

---

# Phase 5 — LanceDB

### 21. Define vector schema

Conceptually:

```text
id
vector
content
metadata
```

Use a schema appropriate for the actual LanceDB API/version in the project.

### 22. Create LanceDB connection

### 23. Implement insert operation

For example:

```ts
addChunks()
```

### 24. Implement delete operation

### 25. Implement update/upsert operation

Prefer an appropriate upsert strategy if it simplifies consistency.

---

# Phase 6 — Indexer

### 26. Create full indexing pipeline

```text
files
↓
documents
↓
chunks
↓
embeddings
↓
LanceDB
```

### 27. Add file hashing

Use a deterministic content hash such as SHA-256.

### 28. Store index state

For example:

```json
{
  "auth.md": {
    "hash": "..."
  }
}
```

The actual implementation may use a better persistent representation if appropriate.

### 29. Build incremental indexing

Only reprocess files whose relevant content or metadata changed.

### 30. Add filesystem watchers

Use:

```ts
chokidar
```

Watchers must integrate cleanly with the indexing service and must not create duplicate indexing processes or inconsistent database state.

---

# Phase 7 — Retrieval Layer

### 31. Create vector retriever

Implement semantic similarity search.

### 32. Add metadata filters

Support filtering by concepts such as:

* project
* tags
* type

### 33. Add project isolation

A project-specific query must not accidentally retrieve another project's memories.

### 34. Add score threshold

Allow irrelevant low-confidence results to be discarded.

### 35. Merge/deduplicate overlapping results

Avoid returning unnecessarily repetitive chunks.

---

# Phase 8 — Formatter Layer

### 36. Build formatter abstraction

Separate retrieval/domain results from presentation formats.

### 37. Create markdown formatter

Example:

```md
## Memory 1

...
```

### 38. Create compact LLM/context formatter

Optimize output for agent consumption without leaking internal database structures.

---

# Phase 9 — Semantic Search Services

Implement appropriate application services for:

### 39.

```ts
memorySearch()
```

### 40.

```ts
adrSearch()
```

### 41.

```ts
bugSearch()
```

### 42.

```ts
decisionSearch()
```

### 43.

```ts
snippetSearch()
```

These should reuse common retrieval infrastructure rather than duplicating search logic.

---

# Phase 10 — MCP Server

### 44. Setup MCP server

Use:

```ts
@modelcontextprotocol/sdk
```

### 45. Register MCP tools

At minimum:

```text
memory_search
adr_search
bug_search
decision_search
snippet_search
```

### 46. Add input schemas

Use:

```ts
zod
```

### 47. Implement MCP handlers

Conceptually:

```text
MCP tool
↓
application service
↓
retriever
↓
formatter
↓
MCP response
```

MCP-specific concerns must remain outside the core domain logic.

---

# Phase 11 — Packaging

### 48. Build CLI/server entrypoint

Support running the engine independently.

### 49. Add configuration loading

Support appropriate environment variables and/or configuration files.

### 50. Produce build artifacts

```text
dist/
```

Ensure the production entrypoint does not depend on development-only tooling.

---

# Phase 12 — OpenCode Integration

### 51. Register MCP server

Integrate the engine with OpenCode.

### 52. Verify Planner integration

Planner should be able to invoke:

```text
memory_search()
```

### 53. Verify Builder integration

Builder should be able to invoke:

```text
bug_search()
```

### 54. Verify Reviewer integration

Reviewer should be able to invoke:

```text
decision_search()
```

---

# Phase 13 — Memory Writing

### 55. Create memory writer

```ts
memoryStore()
```

### 56. Persist markdown memories

Generate appropriate:

```text
memory/*.md
```

files while preserving valid metadata/frontmatter.

### 57. Automatically index new memories

Newly written memories should become searchable without requiring a full application restart.

---

# Phase 14 — Cross-project Intelligence

### 58. Global search

Support:

```ts
project = "*"
```

or an equivalent explicit global scope.

### 59. ADR relationships

Find related decisions and architectural context.

### 60. Bug history

Retrieve similar or historically related bugs.

### 61. Snippet library

Support reusable technical knowledge.

### 62. Semantic deduplication

Detect substantially duplicate memories.

### 63. Summarization

Generate project-level summaries such as:

```text
project-summary.md
```

### 64. Importance scoring

Allow important memories to rank above less useful ones.

### 65. Aging and archival

Support identifying or archiving stale memories.

### 66. Multi-user support

Introduce namespace isolation if and when justified by the architecture.

---

# Phase 15 — Future

These are intentionally not mandatory for the current implementation unless the existing architecture makes them necessary:

### 67. Hybrid retrieval

Vector + keyword retrieval.

### 68. Reranking

Cross-encoder or equivalent reranking.

### 69. Knowledge graph

Represent relationships between decisions, bugs, projects, memories, etc.

### 70. Multi-agent memory

Shared memory capabilities across multiple agents.

---

# IMPORTANT: Audit before implementation

Before modifying the project, inspect the entire repository.

Review at minimum:

* source files
* package.json
* tsconfig
* eslint/prettier configuration
* tests
* configuration files
* database implementation
* indexer
* embedding implementation
* retrievers
* MCP implementation
* CLI/server entrypoint
* OpenCode integration
* README/documentation
* existing scripts
* environment/configuration handling

Also inspect Git history where useful to understand why questionable decisions were made.

Do not assume the current implementation matches the roadmap.

Create an internal implementation map:

```text
Milestone → status → relevant files → problems → required action
```

Classify each milestone as:

* complete
* mostly complete
* partially complete
* broken
* missing
* obsolete
* needs architectural refactoring

Do this based on actual code, not filenames.

---

# IMPORTANT: Architecture refactoring

The existing implementation should be reviewed specifically for architectural weaknesses.

## 1. Remove inappropriate singletons

Look for patterns such as:

```ts
export const db = ...
export const embeddingService = ...
export const memoryService = ...
```

or classes with static/global instances.

Do not blindly remove every singleton.

Determine which dependencies should instead be created in a **composition root**.

Prefer:

```text
Composition Root
       ↓
Application
       ↓
Domain
       ↓
Infrastructure
```

For example:

```ts
const db = createDatabase(config);
const embeddings = createEmbeddingService(config);
const repository = createMemoryRepository(db);
const retriever = createMemoryRetriever(repository, embeddings);
const memoryService = createMemoryService(retriever);

const mcpServer = createMcpServer({
  memoryService,
  ...
});
```

The exact implementation should follow the existing codebase and appropriate TypeScript practices.

Dependencies should be explicit and injectable.

This will make the project:

* easier to test
* easier to replace infrastructure
* easier to run in different environments
* less coupled
* easier to extend

---

# Domain architecture

Review whether the current domain model is sufficiently expressive.

Do not allow infrastructure concepts such as:

```text
LanceDB
Ollama
MCP
filesystem
chokidar
```

to leak unnecessarily into the core domain.

Consider separating concepts such as:

```text
Memory
MemoryDocument
MemoryChunk
MemoryMetadata
Project
ProjectId
MemoryType
SearchQuery
SearchResult
```

from infrastructure concerns:

```text
LanceDbMemoryRepository
OllamaEmbeddingProvider
FileSystemMemorySource
ChokidarMemoryWatcher
McpToolAdapter
```

Use interfaces at meaningful architectural boundaries.

Do not introduce interfaces merely for the sake of abstraction.

---

# Consider FSD, but don't force it

Evaluate whether traditional Feature-Sliced Design is actually appropriate for this backend/infrastructure-oriented TypeScript application.

If FSD is useful, adapt it rather than applying frontend FSD conventions mechanically.

For example, a domain-oriented structure may be more appropriate:

```text
src/
├── app/
│   ├── composition-root/
│   └── config/
│
├── domain/
│   ├── memory/
│   ├── project/
│   └── search/
│
├── application/
│   ├── indexing/
│   ├── retrieval/
│   ├── memory-writing/
│   └── search/
│
├── infrastructure/
│   ├── filesystem/
│   ├── embeddings/
│   ├── lancedb/
│   ├── watchers/
│   └── persistence/
│
├── interfaces/
│   ├── mcp/
│   └── cli/
│
└── shared/
    ├── errors/
    ├── logging/
    └── utilities/
```

This is only an example.

Inspect the existing code and choose the architecture that provides the best separation of concerns without introducing unnecessary complexity.

---

# Architectural rules

Prefer these dependency directions:

```text
interfaces
    ↓
application
    ↓
domain

infrastructure
    ↑
application/domain interfaces
```

Avoid:

```text
domain
↓
LanceDB
```

or:

```text
domain
↓
Ollama
```

or:

```text
domain
↓
MCP SDK
```

The core domain should remain infrastructure-independent.

---

# Important engineering principles

## Do not rewrite everything unnecessarily

Preserve working code where it is already well-designed.

Refactor when there is a clear architectural, correctness, maintainability, or extensibility reason.

## Avoid speculative abstractions

Do not create factories/interfaces/managers solely because they might be useful someday.

## Prefer composition over global state

Dependencies should normally be constructed once in the composition root and passed explicitly.

## Keep MCP as an adapter

MCP should expose application capabilities, not contain business logic.

## Keep LanceDB as infrastructure

Application/domain code should not directly depend on LanceDB APIs.

## Keep Ollama as infrastructure

Embedding generation should be behind an appropriate abstraction.

## Keep filesystem concerns isolated

Markdown discovery, file watching, and file persistence should not be mixed with search/domain logic.

---

# Testing requirements

Do not only implement functionality.

Add or improve tests for important boundaries.

Prioritize:

1. metadata parsing
2. document creation
3. chunking
4. deterministic IDs
5. embedding service behavior
6. indexing
7. incremental indexing
8. repository operations
9. retrieval filters
10. project isolation
11. search services
12. MCP tool handlers
13. memory writing
14. composition root/bootstrap

Use mocks/fakes at architectural boundaries instead of requiring real Ollama/LanceDB infrastructure for every unit test.

Add integration tests where real infrastructure behavior is important.

---

# Current execution strategy

Do NOT attempt to implement all remaining milestones in one uncontrolled change.

Instead:

### Step 1 — Audit

Inspect the existing implementation and determine the real state of milestones 1–53.

### Step 2 — Architecture assessment

Identify:

* singleton/global state
* incorrect dependency direction
* weak domain boundaries
* infrastructure leakage
* duplicated logic
* inappropriate abstractions
* missing tests
* configuration problems
* lifecycle/resource-management problems

### Step 3 — Architecture refactor

Perform the minimum coherent refactoring required to establish a clean foundation.

Prioritize:

```text
composition root
↓
dependency injection
↓
domain/application/infrastructure boundaries
↓
testability
```

### Step 4 — Repair existing functionality

Fix incomplete or broken milestones before adding new functionality.

### Step 5 — Continue roadmap

Continue from the first genuinely incomplete milestone.

Do not blindly restart at milestone 54 if earlier milestones are broken.

### Step 6 — Validate continuously

After each coherent group of changes:

* run type checking
* run linting
* run tests
* run build
* verify relevant integration behavior

Fix regressions before moving forward.

---

# Code quality expectations

Use modern TypeScript.

Prefer:

* strict typing
* explicit domain types
* small cohesive modules
* dependency injection through constructors/functions
* immutable data where practical
* meaningful error types
* async/await
* explicit resource lifecycle management
* clear configuration boundaries

Avoid:

* `any` unless genuinely unavoidable
* global mutable state
* hidden initialization
* circular dependencies
* infrastructure logic in domain modules
* duplicated search implementations
* giant service classes
* unnecessary `Manager`/`Utils` abstractions
* premature generic frameworks

---

# Documentation

Update the README/documentation when architecture or usage changes.

Document:

* architecture
* directory structure
* configuration
* project registry
* indexing
* embeddings
* LanceDB
* MCP integration
* OpenCode integration
* development commands
* testing
* environment variables

If the architecture changes substantially, create or update an architecture document/ADR explaining the important decisions.

---

# Definition of done

The work is not considered complete merely because the code compiles.

At the end of the work:

* existing implementation has been audited
* milestones 1–53 have a known status
* broken/incomplete functionality has been repaired
* singleton/global dependency problems have been addressed where appropriate
* composition root is established
* domain/application/infrastructure boundaries are clear
* tests cover important boundaries
* MCP remains an adapter rather than a business-logic layer
* OpenCode integration works
* milestones 54+ are implemented incrementally as far as practical
* typecheck passes
* lint passes
* tests pass
* production build passes
* documentation reflects the actual architecture

---

# Working style

Act as a senior TypeScript architect and engineer taking ownership of an existing codebase.

**First understand the repository, then change it.**

Do not provide a superficial assessment based only on the roadmap.

Do not ask me to manually explain the existing implementation if it can be discovered by inspecting the repository.

When you encounter an architectural decision that should be changed, explain the reason briefly and implement the better approach.

When there are multiple reasonable architectural options, prefer the simplest option that provides strong boundaries, testability, and future extensibility.

Keep changes incremental and coherent.

Start by auditing the repository and determining the actual current implementation state before making substantial changes.
