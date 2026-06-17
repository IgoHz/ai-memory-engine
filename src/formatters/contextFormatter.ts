import type { Formatter } from './types.js';
import type { RetrievedChunk } from '../retrievers/types.js';

export class ContextFormatter implements Formatter {
  format(chunks: RetrievedChunk[]): string {
    return chunks
      .map(
        (chunk) => `[${chunk.metadata.type}] ${chunk.metadata.title}

${chunk.content}`
      )
      .join('\n\n');
  }
}
