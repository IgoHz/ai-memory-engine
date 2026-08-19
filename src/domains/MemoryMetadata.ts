export interface MemoryMetadata {
  project: string;

  type?: string;

  title?: string;

  tags: string[];

  importance: number;

  archived: boolean;

  relatedTo: string[];

  filePath: string;

  updatedAt?: string;
}
