import { PATHS } from './paths.js';
import { z } from 'zod';

const EnvSchema = z.object({
  OLLAMA_BASE_URL: z.string().url(),
  OLLAMA_MODEL: z.string(),
  DB_PATH: z.string()
});

export const env = EnvSchema.parse({
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',

  OLLAMA_MODEL: process.env.OLLAMA_MODEL ?? 'nomic-embed-text',

  DB_PATH: process.env.DB_PATH ?? PATHS.DB
});
