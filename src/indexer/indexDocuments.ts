import { lancedbService } from '../db/LanceDbService.js';
import { MemoryDocument } from '../types/memory.js';
import { createDocumentChunks } from '../chunkers/createDocumentChunks.js';
import { generateEmbeddings } from '../embeddings/index.js';

export async function indexDocuments(
  project: string,
  documents: MemoryDocument[]
): Promise<void> {
  for (const document of documents) {
    const chunks = await createDocumentChunks([document]);

    const embeddings = await generateEmbeddings(
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
