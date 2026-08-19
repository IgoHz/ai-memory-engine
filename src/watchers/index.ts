import 'dotenv/config';
import { projectRegistry } from '../config/registry.js';
import { MemoryWatcher } from './MemoryWatcher.js';
import { createApplication } from '../app/compositionRoot.js';

const registry = await projectRegistry.loadProjects();
const watcher = new MemoryWatcher(createApplication().indexer);

watcher.startAllWatchers(registry);

const shutdown = async () => {
  await watcher.stopAllWatchers();
  process.exit(0);
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
