import { getDatabase } from './connect.js';
import { TABLE_NAME } from './tableSchema.js';

export async function countVectors(): Promise<number> {
  const db = await getDatabase();

  const table = await db.openTable(TABLE_NAME);

  return table.countRows();
}
