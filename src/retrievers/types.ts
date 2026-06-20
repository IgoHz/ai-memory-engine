export interface FilterOptions {
  project?: string;
  type?: string;
  tags?: string[];
  path?: string;
}

export interface RetrieverSearchOptions {
  limit?: number;
  minScore?: number;
  filters?: FilterOptions;
}
