import { getProjectTable } from './getProjectTable.js';

export async function getChunksTable(project: string) {
  return getProjectTable(project);
}
