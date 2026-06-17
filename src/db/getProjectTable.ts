import { getDatabase } from './connect.js';
import { getProjectTableName } from './getProjectTableName.js';

export async function getProjectTable(project: string) {
  const db = await getDatabase();

  return db.openTable(getProjectTableName(project));
}
