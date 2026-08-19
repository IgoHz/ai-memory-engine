import z from 'zod';

export const ProjectSchema = z.object({
  memoryDir: z.string()
});
