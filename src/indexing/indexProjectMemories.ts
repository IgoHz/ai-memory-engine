import { incrementalIndexer } from './IncrementalIndexer.js';

export async function indexProjectMemories(): Promise<void> {
  await incrementalIndexer.indexAllProjects();
}
