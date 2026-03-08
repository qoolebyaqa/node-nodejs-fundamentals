import fs from 'fs/promises';
import path from 'path';

const snapshot = async () => {
  try {
    const absRoot = path.resolve('workspace');
    const entries = [];

    async function scan(currentPath) {
      const items = await fs.readdir(currentPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(currentPath, item.name);
        const relPath = path.relative(absRoot, fullPath);

        if (item.isDirectory()) {
          entries.push({
            path: relPath,
            type: 'directory'
          });

          await scan(fullPath);
        } else if (item.isFile()) {
          const stat = await fs.stat(fullPath);
          const content = await fs.readFile(fullPath);

          entries.push({
            path: relPath,
            type: 'file',
            size: stat.size,
            content: content.toString('base64')
          });
        }
      }
    }

    await scan(absRoot);

    const snapshot = {
      rootPath: absRoot,
      entries
    };

    const snapshotPath = path.join(absRoot, 'snapshot.json');
    await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2));

  } catch {
    throw new Error('FS operation failed');
  }
};

await snapshot();
