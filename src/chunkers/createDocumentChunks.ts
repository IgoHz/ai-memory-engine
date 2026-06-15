import type { MemoryDocument } from '../types/memory.js';
import type { MemoryChunk } from '../types/memoryChunk.js';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export async function createDocumentChunks(
  documents: MemoryDocument[]
): Promise<MemoryChunk[]> {
  const chunkGroups = await Promise.all(documents.map(createChunks));

  return chunkGroups.flat();
}

async function createChunks(document: MemoryDocument): Promise<MemoryChunk[]> {
  const splitter = createTextSplitter();

  const chunks = await splitter.splitText(document.content);

  return chunks.map((content, index) => ({
    id: createChunkId(document.metadata.filePath, index),

    content,

    metadata: document.metadata
  }));
}

function createChunkId(path: string, index: number): string {
  return `${path}#chunk-${index}`;
}

function createTextSplitter(): RecursiveCharacterTextSplitter {
  return new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  });
}
