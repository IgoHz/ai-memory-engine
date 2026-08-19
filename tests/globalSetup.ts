import { buildIntegrationIndex } from './helpers/buildIntegrationIndex.js';

export default async function globalSetup() {
  await buildIntegrationIndex();
}