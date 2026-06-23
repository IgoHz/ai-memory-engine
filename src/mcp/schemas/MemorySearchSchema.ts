import { z } from 'zod';

export const MemorySearchSchema = {
  query: z.string(),
  project: z.string(),
  limit: z.number().optional(),
  minScore: z.number().optional(),
  tags: z.array(z.string()).optional()
};
