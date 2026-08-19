export interface IEmbeddingsProvider {
  generateEmbedding(text: string): Promise<number[]>;

  generateEmbeddings(texts: string[]): Promise<number[][]>;
}
