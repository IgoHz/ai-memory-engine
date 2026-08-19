import { describe, expect, it } from 'vitest';
import { DatabaseConnection } from '../../src/repositories/DatabaseConnection.js';

describe('Debug LanceDB', () => {
  const databaseConnection = new DatabaseConnection();

  it('should inspect database state', async () => {
    const db = await databaseConnection.getDatabase();

    const tables = await db.tableNames();

    console.log('TABLES', tables);

    expect(tables.length).toBeGreaterThan(0);
  });

  it('should inspect table rows', async () => {
    const db = await databaseConnection.getDatabase();

    const table = await db.openTable('memory_chunks_ai-memory-engine');

    const rows = await table.countRows();

    console.log('ROWS', rows);

    expect(rows).toBeGreaterThan(0);
  });
});