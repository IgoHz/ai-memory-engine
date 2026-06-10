import { loadProjects } from './registry/loadProjects.js';
import { discoverFiles } from './loaders/discoverFiles.js';

async function main() {
  const registry = await loadProjects();

  const files = await discoverFiles(registry, 'pet-project');

  console.dir(files, {
    depth: null
  });
}

main();
