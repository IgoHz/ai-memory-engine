import { z } from 'zod';

export const BasicSearchSchema = {
  query: z.string(),
  project: z.string(),
  path: z.string().optional(),
  includeArchived: z.boolean().optional(),
  maxAgeDays: z.number().min(0).optional(),
  relatedTo: z.array(z.string()).optional()
};
