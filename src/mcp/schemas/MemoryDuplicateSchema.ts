import { z } from 'zod';

export const MemoryDuplicateSchema = {
  project: z.string(),
  threshold: z.number().min(0).max(1).optional(),
  limit: z.number().min(1).max(100).optional()
};
