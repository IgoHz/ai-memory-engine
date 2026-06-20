import type { ProjectConfig, ProjectsRegistry } from '../domains/Project';
import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { z } from 'zod';

const projectSchema = z.object({
  root: z.string(),
  memoryDir: z.string()
});

const registrySchema = z.object({
  projects: z.record(z.string(), projectSchema)
});

let cachedRegistry: ProjectsRegistry | undefined;

class ProjectRegistry {
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

export const projectRegistry = new ProjectRegistry();
