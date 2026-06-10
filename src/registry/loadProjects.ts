import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { ProjectsRegistry } from '../types/project.js';
import { registrySchema } from './projectSchema.js';

let cachedRegistry: ProjectsRegistry | undefined;

export async function loadProjects(): Promise<ProjectsRegistry> {
  if (cachedRegistry) {
    return cachedRegistry;
  }

  const configPath = path.resolve(process.cwd(), 'config', 'projects.yaml');

  const yamlContent = await fs.readFile(configPath, 'utf-8');

  const parsed = YAML.parse(yamlContent);

  const validated = registrySchema.parse(parsed);

  return validated;
}
