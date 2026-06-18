import type { ProjectConfig, ProjectsRegistry } from '../types/project';
import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { registrySchema } from './projectSchema.js';

let cachedRegistry: ProjectsRegistry | undefined;

class RegistryService {
  getProject(registry: ProjectsRegistry, projectName: string): ProjectConfig {
    const project = registry.projects[projectName];

    if (!project) {
      throw new Error(`Unknown project: ${projectName}`);
    }

    return project;
  }

  async loadProjects(): Promise<ProjectsRegistry> {
    if (cachedRegistry) {
      return cachedRegistry;
    }

    const configPath = path.resolve(process.cwd(), 'config', 'projects.yaml');

    const yamlContent = await fs.readFile(configPath, 'utf-8');

    const parsed = YAML.parse(yamlContent);

    const validated = registrySchema.parse(parsed);

    return validated;
  }
}

export const registryService = new RegistryService();
