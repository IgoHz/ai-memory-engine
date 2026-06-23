import { MemoryDocument } from '../domains/MemoryDocument.js';
import { MemoryChunk } from '../domains/MemoryChunk.js';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { ChunkingResult, ChunkStats } from './types.js';

const MIN_CHUNK_LENGTH = 50;
const MAX_WHITESPACE_RATIO = 0.8;
const MIN_WORD_COUNT = 5;

class MemoryChunker {
  public async createProjectChunks(
    documents: MemoryDocument[]
  ): Promise<ChunkingResult> {
    const rawChunks = await this.createDocumentChunks(documents);

    const chunks = this.filterChunks(rawChunks);

    const stats = this.getChunkStats(rawChunks, chunks);

    return {
      chunks,
      stats
    };
  }

  async createDocumentChunks(
    documents: MemoryDocument[]
  ): Promise<MemoryChunk[]> {
    const chunkGroups = await Promise.all(documents.map(this.createChunks));

    return chunkGroups.flat();
  }

  private async createChunks(document: MemoryDocument): Promise<MemoryChunk[]> {
    const splitter = this.createTextSplitter();

    const chunks = await splitter.splitText(document.content);

    return chunks.map((content, index) => ({
      id: this.createChunkId(document.metadata.filePath, index),

      content,

      metadata: document.metadata
    }));
  }

  private createChunkId(path: string, index: number): string {
    return `${path}#chunk-${index}`;
  }

  private createTextSplitter(): RecursiveCharacterTextSplitter {
    return new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });
  }

  private filterChunks(chunks: MemoryChunk[]): MemoryChunk[] {
    const validChunks = chunks.filter(this.isValidChunk);

    return this.removeDuplicateChunks(validChunks);
  }

  private isValidChunk(chunk: MemoryChunk): boolean {
    const content = chunk.content.trim();

    if (!content) {
      return false;
    }

    if (content.length < MIN_CHUNK_LENGTH) {
      return false;
    }

    if (this.getWordCount(content) < MIN_WORD_COUNT) {
      return false;
    }

    if (this.getWhitespaceRatio(content) > MAX_WHITESPACE_RATIO) {
      return false;
    }

    if (this.isHeadingOnly(content)) {
      return false;
    }

    return true;
  }

  private getWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  private getWhitespaceRatio(text: string): number {
    if (!text.length) {
      return 1;
    }

    const whitespaceCharacters = (text.match(/\s/g) ?? []).length;

    return whitespaceCharacters / text.length;
  }

  private isHeadingOnly(text: string): boolean {
    const lines = text.trim().split('\n').filter(Boolean);

    if (lines.length !== 1) {
      return false;
    }

    return /^#+\s/.test(lines[0]);
  }

  private removeDuplicateChunks(chunks: MemoryChunk[]): MemoryChunk[] {
    const seen = new Set<string>();

    return chunks.filter((chunk) => {
      const normalized = chunk.content.trim();

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);

      return true;
    });
  }

  private getChunkStats(
    rawChunks: MemoryChunk[],
    validChunks: MemoryChunk[]
  ): ChunkStats {
    const lengths = validChunks.map((chunk) => chunk.content.length);

    const averageChunkLength =
      lengths.length === 0
        ? 0
        : Math.round(
            lengths.reduce((sum, length) => sum + length, 0) / lengths.length
          );

    return {
      documents: new Set(rawChunks.map((chunk) => chunk.metadata.filePath))
        .size,

      rawChunks: rawChunks.length,

      validChunks: validChunks.length,

      removedChunks: rawChunks.length - validChunks.length,

      averageChunkLength,

      minChunkLength: lengths.length === 0 ? 0 : Math.min(...lengths),

      maxChunkLength: lengths.length === 0 ? 0 : Math.max(...lengths)
    };
  }
}

export const memoryChunker = new MemoryChunker();
