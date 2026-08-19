import { OllamaEmbeddings } from '@langchain/ollama';
import { env } from '../config/env.js';
import { IEmbeddingsProvider } from './types.js';

export class EmbeddingsProvider implements IEmbeddingsProvider {
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
    console.time('embedDocuments');

    const result = await this.embeddings.embedDocuments(texts);

    console.timeEnd('embedDocuments');

    return result;
  }
}

export const embeddingsProvider = new EmbeddingsProvider();
