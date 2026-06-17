import { lancedbService } from '../db';
import { MemoryDocument } from '../types/memory.js';
import { chunkersService } from '../chunkers';
import { embeddingsService } from '../embeddings';

export async function indexDocuments(
  project: string,
  documents: MemoryDocument[]
): Promise<void> {
  for (const document of documents) {
    const chunks = await chunkersService.createDocumentChunks([document]);

    const embeddings = await embeddingsService.generateEmbeddings(
      chunks.map((chunk) => chunk.content)
    );

    await lancedbService.updateDocumentChunks(
      project,
      document.metadata.filePath,
      chunks,
      embeddings
    );
  }
}
