import { z } from 'zod';

export const projectSchema = z.object({
  root: z.string(),
  memoryDir: z.string()
});

export const registrySchema = z.object({
  projects: z.record(z.string(), projectSchema)
});
