import { z } from 'zod';

export const RelatedMemorySchema = {
  project: z.string(),
  relation: z.string(),
  limit: z.number().min(1).max(100).optional()
};
