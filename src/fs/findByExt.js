import fs from 'fs/promises';
import path from 'path';

const findByExt = async () => {
 const args = process.argv.slice(2);
  const extIndex = args.indexOf('--ext');

  let ext = '.txt';
  if (extIndex !== -1 && args[extIndex + 1]) {
    ext = '.' + args[extIndex + 1].replace(/^\./, '');
  }

  const root = path.resolve('workspace');
  const result = [];

  try {
    await fs.access(root);
  } catch {
    throw new Error('FS operation failed');
  }

  async function scan(dir) {
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const full = path.join(dir, item.name);

      if (item.isDirectory()) {
        await scan(full);
      }

      if (item.isFile() && path.extname(item.name) === ext) {
        const rel = path.relative(root, full);
        result.push(rel);
      }
    }
  }

  await scan(root);

  result
    .sort((a, b) => a.localeCompare(b))
    .forEach(p => console.log(p));
};

await findByExt();
