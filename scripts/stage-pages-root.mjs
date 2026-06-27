import { cp, copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

await copyFile(resolve(root, 'dist/index.html'), resolve(root, 'index.html'));
await mkdir(resolve(root, 'assets'), { recursive: true });
await cp(resolve(root, 'dist/assets'), resolve(root, 'assets'), {
  recursive: true,
  force: true
});

for (const fileName of ['CNAME', 'favicon.svg']) {
  try {
    await copyFile(resolve(root, 'dist', fileName), resolve(root, fileName));
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }
}
