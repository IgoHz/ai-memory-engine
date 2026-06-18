import type { Formatter } from './types.js';
import type { RetrievedChunk } from '../retrievers/types.js';

class ContextFormatterService implements Formatter {
  format(chunks: RetrievedChunk[]): string {
    return chunks
      .map(
        (chunk) => `[${chunk.metadata.type}] ${chunk.metadata.title}

${chunk.content}`
      )
      .join('\n\n');
  }
}

export const contextFormatterService = new ContextFormatterService();
