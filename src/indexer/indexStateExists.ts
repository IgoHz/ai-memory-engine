import { access } from 'node:fs/promises';

const INDEX_STATE_PATH = './db/indexState.json';

export async function indexStateExists(): Promise<boolean> {
  try {
    await access(INDEX_STATE_PATH);

    return true;
  } catch {
    return false;
  }
}
