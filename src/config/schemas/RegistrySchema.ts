import z from 'zod';
import { ProjectSchema } from './ProjectSchema.js';

export const RegistrySchema = z.object({
  projects: z.record(z.string(), ProjectSchema)
});
