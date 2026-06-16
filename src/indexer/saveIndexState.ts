import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { IndexState } from '../types/indexState.js';

const INDEX_STATE_PATH = './db/indexState.json';

export async function saveIndexState(state: IndexState): Promise<void> {
  await mkdir(dirname(INDEX_STATE_PATH), {
    recursive: true
  });

  await writeFile(INDEX_STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}
