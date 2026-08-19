import path from 'node:path';

import { ProjectRegistry } from './ProjectRegistry.js';

export const projectRegistry = new ProjectRegistry(
  path.resolve(process.cwd(), 'config', 'projects.yaml')
);
