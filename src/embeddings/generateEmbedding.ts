import { generateEmbeddings } from './generateEmbeddings.js';

export async function generateEmbedding(text: string): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text]);

  return embedding;
}
