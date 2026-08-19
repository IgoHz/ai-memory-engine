import { z } from 'zod';

export const MemoryStoreSchema = {
  project: z.string(),
  fileName: z.string(),
  content: z.string(),
  type: z.string().optional(),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  importance: z.number().min(0).max(1).optional(),
  archived: z.boolean().optional(),
  relatedTo: z.array(z.string()).optional()
};
