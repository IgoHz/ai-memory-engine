import type { MemoryDocument } from '../types/memory.js';
import { createDocumentChunks } from '../chunkers/createDocumentChunks.js';
import { updateDocumentChunks } from '../db/index.js';
import { generateEmbeddings } from '../embeddings/index.js';

export async function indexDocument(document: MemoryDocument): Promise<void> {
  const chunks = await createDocumentChunks([document]);

  const embeddings = await generateEmbeddings(
    chunks.map((chunk) => chunk.content)
  );

  await updateDocumentChunks(document.metadata.filePath, chunks, embeddings);
}
