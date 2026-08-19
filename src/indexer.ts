import { createApplication } from './app/compositionRoot.js';

await createApplication().indexer.indexAllProjects();
