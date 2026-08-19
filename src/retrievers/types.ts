export interface FilterOptions {
  project?: string;
  type?: string;
  tags?: string[];
  path?: string;
}

export interface RetrieverSearchOptions {
  limit?: number;
  maxDistance?: number;
  filters?: FilterOptions;
}
