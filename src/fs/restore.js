import fs from 'fs/promises';
import path from 'path';

const restore = async () => {
  const snapshotPath = path.resolve('workspace/snapshot.json');
  const restoreRoot = path.resolve('workspace/workspace_restored');

  try {
    await fs.access(snapshotPath);
  } catch {
    throw new Error('FS operation failed');
  }

  try {
    await fs.access(restoreRoot);
    throw new Error('FS operation failed');
  } catch (err) {
    if (err.message === 'FS operation failed') throw err;
  }

  try {
    const data = await fs.readFile(snapshotPath, 'utf8');
    const snapshot = JSON.parse(data);

    await fs.mkdir(restoreRoot);

    for (const entry of snapshot.entries) {
      const targetPath = path.join(restoreRoot, entry.path);

      if (entry.type === 'directory') {
        await fs.mkdir(targetPath, { recursive: true });
      }

      if (entry.type === 'file') {
        await fs.mkdir(path.dirname(targetPath), { recursive: true });

        const buffer = Buffer.from(entry.content, 'base64');
        await fs.writeFile(targetPath, buffer);
      }
    }
  } catch {
    throw new Error('FS operation failed');
  }
}

await restore();
