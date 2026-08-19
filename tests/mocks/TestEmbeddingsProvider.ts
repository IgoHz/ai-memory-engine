import { IEmbeddingsProvider } from '../../src/embeddings/types.js';

export class TestEmbeddingsProvider
  implements IEmbeddingsProvider
{
  async generateEmbedding(): Promise<number[]> {
    return new Array(768).fill(0.1);
  }

  async generateEmbeddings(
    texts: string[]
  ): Promise<number[][]> {
    return texts.map(
      () => new Array(768).fill(0.1)
    );
  }
}