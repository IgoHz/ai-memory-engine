const activeProjects = new Set<string>();

export function isReindexing(projectName: string): boolean {
  return activeProjects.has(projectName);
}

export function beginReindex(projectName: string): void {
  activeProjects.add(projectName);
}

export function finishReindex(projectName: string): void {
  activeProjects.delete(projectName);
}
