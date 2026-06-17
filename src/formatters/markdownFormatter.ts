import type { Formatter } from './types.js';
import type { RetrievedChunk } from '../retrievers/types.js';

export class MarkdownFormatter implements Formatter {
  format(chunks: RetrievedChunk[]): string {
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
