import { RetrievedChunk } from '../types/retriever';

class FormattersService {
  formatContext(chunks: RetrievedChunk[]): string {
    return chunks
      .map(
        (chunk) => `[${chunk.metadata.type}] ${chunk.metadata.title}

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

export const formattersService = new FormattersService();
