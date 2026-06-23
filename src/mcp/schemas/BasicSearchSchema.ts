import { z } from 'zod';

export const BasicSearchSchema = {
  query: z.string(),
  project: z.string()
};
