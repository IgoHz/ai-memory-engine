export interface ProjectConfig {
  memoryDir: string;
}

export interface ProjectsRegistry {
  projects: Record<string, ProjectConfig>;
}
