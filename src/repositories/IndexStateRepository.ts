import { IndexState } from '../domains/IndexState';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { PATHS } from '../config/paths';

class IndexStateRepository {
  async load(): Promise<IndexState> {
    try {
      const content = await readFile(PATHS.INDEX_STATE, 'utf8');

      return JSON.parse(content) as IndexState;
    } catch {
      return {};
    }
  }

  async save(state: IndexState): Promise<void> {
    await mkdir(dirname(PATHS.INDEX_STATE), {
      recursive: true
    });

    await writeFile(PATHS.INDEX_STATE, JSON.stringify(state, null, 2), 'utf8');
  }
}

export const indexStateRepository = new IndexStateRepository();
