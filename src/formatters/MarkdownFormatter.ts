import { RetrievedChunk } from '../domains/RetrievedChunk.js';

class MarkdownFormatter {
  formatContext(chunks: RetrievedChunk[]): string {
    return chunks
      .map(
        (chunk) => `[${chunk.metadata.project}/${chunk.metadata.type}] ${chunk.metadata.title}

${chunk.content}`
      )
      .join('\n\n');
  }

  formatMarkdown(chunks: RetrievedChunk[]): string {
    return chunks
      .map(
        (chunk) => `
## ${chunk.metadata.title}

Path: ${chunk.metadata.filePath}

${chunk.content}
`
      )
      .join('\n---\n');
  }
}

export const markdownFormatter = new MarkdownFormatter();
