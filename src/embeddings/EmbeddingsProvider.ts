import { OllamaEmbeddings } from '@langchain/ollama';
import { env } from '../config/env.js';

class EmbeddingsProvider {
  private readonly embeddings: OllamaEmbeddings;

  constructor() {
    this.embeddings = new OllamaEmbeddings({
      baseUrl: env.OLLAMA_BASE_URL,
      model: env.OLLAMA_MODEL
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const [embedding] = await this.generateEmbeddings([text]);

    return embedding;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return this.embeddings.embedDocuments(texts);
  }
}

export const embeddingsProvider = new EmbeddingsProvider();
