import type { MemoryDocument } from '../types/memory.js';
import { lancedbService } from '../db';
import { chunkersService } from '../chunkers';
import { embeddingsService } from '../embeddings';

export async function indexDocument(document: MemoryDocument): Promise<void> {
  const chunks = await chunkersService.createDocumentChunks([document]);

  const embeddings = await embeddingsService.generateEmbeddings(
    chunks.map((chunk) => chunk.content)
  );

  await lancedbService.updateDocumentChunks(
    document.metadata.project,
    document.metadata.filePath,
    chunks,
    embeddings
  );
}
