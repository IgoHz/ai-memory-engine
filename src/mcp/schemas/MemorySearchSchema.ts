import { z } from 'zod';

export const MemorySearchSchema = {
  query: z.string(),
  project: z.string(),
  limit: z.number().optional(),
  maxDistance: z.number().optional(),
  tags: z.array(z.string()).optional(),
  path: z.string().optional(),
  includeArchived: z.boolean().optional(),
  maxAgeDays: z.number().min(0).optional(),
  relatedTo: z.array(z.string()).optional()
};
