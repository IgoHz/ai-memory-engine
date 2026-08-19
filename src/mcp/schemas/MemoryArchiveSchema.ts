import { z } from 'zod';

export const MemoryArchiveSchema = {
  project: z.string(),
  maxAgeDays: z.number().min(0)
};
