import path from 'node:path';

export const PATHS = {
  DB_DIR: path.join(process.cwd(), 'db'),

  INDEX_STATE: path.join(process.cwd(), 'db', 'indexState.json')
};
