import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { resolveProjectMemoryDir } from '../../src/config/resolveProjectMemoryDir.js';

describe('resolveProjectMemoryDir', () => {
  it('resolves relative paths from the working directory', () => {
    expect(
      resolveProjectMemoryDir({ memoryDir: 'memories' }, '/workspace')
    ).toBe(path.join('/workspace', 'memories'));
  });

  it('preserves absolute paths', () => {
    expect(
      resolveProjectMemoryDir(
        { memoryDir: '/shared/music-platform/.ai-memory' },
        '/workspace'
      )
    ).toBe('/shared/music-platform/.ai-memory');
  });
});