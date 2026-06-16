import { readFile } from 'node:fs/promises';
import type { IndexState } from '../types/indexState.js';

const INDEX_STATE_PATH = './db/indexState.json';

export async function loadIndexState(): Promise<IndexState> {
  try {
    const content = await readFile(INDEX_STATE_PATH, 'utf8');

    return JSON.parse(content) as IndexState;
  } catch {
    return {};
  }
}
