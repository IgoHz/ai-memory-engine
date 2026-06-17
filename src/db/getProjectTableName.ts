export function getProjectTableName(project: string): string {
  return `memory_chunks_${project}`;
}
