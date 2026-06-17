import type { RetrievedChunk } from '../retrievers/types.js';

export interface Formatter {
  format(chunks: RetrievedChunk[]): string;
}
