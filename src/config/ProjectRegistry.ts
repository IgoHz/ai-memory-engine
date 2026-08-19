import type { ProjectConfig, ProjectsRegistry } from '../domains/Project.js';
import fs from 'node:fs/promises';
import YAML from 'yaml';
import { RegistrySchema } from './schemas/RegistrySchema.js';

class ProjectRegistry {
  private cachedRegistry: ProjectsRegistry | undefined;

  constructor(private readonly configPath: string) {}

  getProject(registry: ProjectsRegistry, projectName: string): ProjectConfig {
    const project = registry.projects[projectName];

    if (!project) {
      throw new Error(`Unknown project: ${projectName}`);
    }

    return project;
  }

  async loadProjects(): Promise<ProjectsRegistry> {
    if (this.cachedRegistry) {
      return this.cachedRegistry;
    }

    const yamlContent = await fs.readFile(this.configPath, 'utf-8');

    const parsed = YAML.parse(yamlContent);

    const validated = RegistrySchema.parse(parsed);

    this.cachedRegistry = validated;

    return this.cachedRegistry;
  }
}

export { ProjectRegistry };
