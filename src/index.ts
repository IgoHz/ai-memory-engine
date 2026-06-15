import { addChunks, countVectors } from './db/index.js';

import type { MemoryChunk } from './types/memoryChunk.js';

async function main() {
  const chunks: MemoryChunk[] = [
    {
      id: 'auth.md#chunk-1',

      content: 'JWT refresh tokens are used for session renewal.',

      metadata: {
        project: 'pet-project',

        type: 'adr',

        tags: ['auth', 'jwt'],

        title: 'JWT architecture',

        filePath: 'memory/auth.md'
      }
    }
  ];

  const embeddings = [Array(768).fill(0.1)];

  await addChunks(chunks, embeddings);

  const count = await countVectors();

  console.log('Total vectors:', count);
}

main();
