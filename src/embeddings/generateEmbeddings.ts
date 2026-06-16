import { OllamaEmbeddings } from '@langchain/ollama';

const embeddings = new OllamaEmbeddings({
  baseUrl: process.env.OLLAMA_BASE_URL,
  model: process.env.OLLAMA_EMBEDDING_MODEL!
});

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  return embeddings.embedDocuments(texts);
}
