export interface ProjectConfig {
  root: string;
  
  memoryDir: string;
}

export interface ProjectsRegistry {
  projects: Record<string, ProjectConfig>;
}
