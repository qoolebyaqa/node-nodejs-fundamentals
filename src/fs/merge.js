import fs from 'fs/promises';
import path from 'path';

const merge = async () => {
  const args = process.argv.slice(2);
  const filesIndex = args.indexOf('--files');

  const workspace = path.resolve('workspace');
  const partsDir = path.join(workspace, 'parts');
  const outputFile = path.join(workspace, 'merged.txt');

  try {
    await fs.access(partsDir);
  } catch {
    throw new Error('FS operation failed');
  }

  let files = [];

  if (filesIndex !== -1 && args[filesIndex + 1]) {
    files = args[filesIndex + 1].split(',').map(f => f.trim());

    for (const file of files) {
      const filePath = path.join(partsDir, file);
      try {
        await fs.access(filePath);
      } catch {
        throw new Error('FS operation failed');
      }
    }
  } else {
    const entries = await fs.readdir(partsDir);
    files = entries
      .filter(name => path.extname(name) === '.txt')
      .sort((a, b) => a.localeCompare(b));

    if (files.length === 0) {
      throw new Error('FS operation failed');
    }
  }

  let result = '';

  for (const file of files) {
    const filePath = path.join(partsDir, file);
    const content = await fs.readFile(filePath, 'utf8');
    result += content;
  }

  await fs.writeFile(outputFile, result);
}

await merge();
