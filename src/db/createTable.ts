import type { Connection } from '@lancedb/lancedb';
import { TABLE_NAME } from './tableSchema.js';

export async function createTable(connection: Connection) {
  try {
    return await connection.openTable(TABLE_NAME);
  } catch {
    // return connection.createTable(TABLE_NAME, []);
    return null;
  }
}
