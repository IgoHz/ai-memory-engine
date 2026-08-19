import type { VectorRecord } from '../repositories/types.js';
import type MemoryChunkRepository from '../repositories/MemoryChunkRepository.js';

export interface DuplicateMatch {
  left: { id: string; path: string; content: string };
  right: { id: string; path: string; content: string };
  similarity: number;
}

export class MemoryDuplicateService {
  constructor(private readonly chunkRepository: MemoryChunkRepository) {}

  async findDuplicates(
    project: string,
    threshold = 0.95,
    limit = 20
  ): Promise<DuplicateMatch[]> {
    if (threshold < 0 || threshold > 1) {
      throw new Error('threshold must be between 0 and 1');
    }

    const records = await this.chunkRepository.getProjectRecords(project);
    const matches: DuplicateMatch[] = [];

    for (let leftIndex = 0; leftIndex < records.length; leftIndex += 1) {
      for (
        let rightIndex = leftIndex + 1;
        rightIndex < records.length;
        rightIndex += 1
      ) {
        const left = records[leftIndex];
        const right = records[rightIndex];

        if (left.metadata.filePath === right.metadata.filePath) {
          continue;
        }

        const similarity = cosineSimilarity(left, right);

        if (similarity >= threshold) {
          matches.push({
            left: toSummary(left),
            right: toSummary(right),
            similarity
          });
        }
      }
    }

    return matches
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, limit);
  }
}

function cosineSimilarity(left: VectorRecord, right: VectorRecord): number {
  if (left.vector.length !== right.vector.length || !left.vector.length) {
    return 0;
  }

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.vector.length; index += 1) {
    dot += left.vector[index] * right.vector[index];
    leftMagnitude += left.vector[index] ** 2;
    rightMagnitude += right.vector[index] ** 2;
  }

  if (!leftMagnitude || !rightMagnitude) {
    return 0;
  }

  return dot / Math.sqrt(leftMagnitude * rightMagnitude);
}

function toSummary(record: VectorRecord) {
  return {
    id: record.id,
    path: record.metadata.filePath,
    content: record.content
  };
}
