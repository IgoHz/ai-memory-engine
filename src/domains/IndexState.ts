export interface IndexedFileState {
  hash: string;
  updatedAt: string;
}

export type IndexState = Record<string, IndexedFileState>;
